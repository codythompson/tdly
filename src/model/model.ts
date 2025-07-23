import { isDef } from "@typed/guards"
import { Document, DocumentItemType, DocumentType } from "./document"
import { DocumentInflater } from "./inflater"
import { DocumentSerializer } from "./serializer"
import { DocumentStorage, DocumentStorageListParams, DocumentStorageParams, Folder } from "./storage"

/**
 * An abstract representation of the todo list app's data model.
 * Consists of documents and document items.
 *
 * Has read and write methods for documents.
 * The documents are defined by the serializers given to the constructor.
 * The storage "engine" is defined by the documentStorage instance given to the constructor.
 */
export class Model<DT extends string = string, DI extends string = string> {
  readonly documentCache = new DocumentCache<DT,DI>()
  readonly storage: DocumentStorage<DT,DI>
  readonly serializer: DocumentSerializer<DT,DI>
  readonly inflaters: Record<DT, DocumentInflater<Document<DT,DI>,DT,DI>>

  /**
   * @param {string} basePath the root directory (or maybe db host in the future) of the data files/base
   * @param serializers serializers for every model/document - required even if the strings are not being stored directly
   *    (i.e. non file based storage)
   */
  constructor(readonly basePath: string, storage: DocumentStorage<DT,DI>, serializer: DocumentSerializer<DT,DI>, inflaters: DocumentInflater<Document<DT,DI>,DT,DI>[]) {
    this.storage = storage;
    this.serializer = serializer
    this.inflaters = Object.fromEntries(
      inflaters
        .map(s => [s.type, s])
    ) as Record<DT, DocumentInflater<Document<DT,DI>,DT,DI>>;
  }

  /**
   * Get the document at the given path (can be a key/id in non file based document storage).
   * Attempts to read from in-memory cache first.
   * @param type 
   * @param relativePath 
   * @returns 
   */
  async readGeneric<T extends DT, I extends DI>(type: T, relativePath: string): Promise<Document<T,I>> {
    const cacheEntry = this.getCached<T, I>(type, relativePath)
    if (isDef(cacheEntry)) {
      return cacheEntry.document
    }

    // if here, no cached version
    const storageParams = this.getStorageParams<T,I>(type, this.getItemTypes<T,I>(type), relativePath);
    const document = await this.storage.read<T,I>(storageParams);
    const hash = await storageParams.serializer.computeHash(document)
    this.documentCache.setEntry(hash, document)

    return document
  }

  /**
   * Get the document at the given path (can be a key/id in non file based document storage).
   * Then converts (AKA parses, AKA inflates) the generic document in the custom one specified by the type
   * Attempts to read from in-memory cache first.
   * @param type 
   * @param relativePath 
   * @returns 
   */
  async read<D extends Document<DT,DI>>(type:DocumentType<D>, relativePath:string):Promise<D> {
    const generic = await this.readGeneric<DocumentType<D>,DocumentItemType<D>>(type, relativePath)
    return this.getInflater<D>(type).inflate(this, generic)
  }

  /**
   * Writes the document to permanent storage if the document is different from the version
   * in this model instance's in-memory cache
   * @param document 
   */
  async write(document: Document<DT, DI>): Promise<void> {
    const newHash = await this.computeNewHashIfNecessary(document);
    if (isDef(newHash)) {
      const storageParams = this.getStorageParams(document.type, document.itemTypes, document.relativePath);
      this.storage.write(storageParams, document)
      const newDocument = await this.storage.read(storageParams)
      this.documentCache.setEntry(newHash, newDocument)
    }
  }

  async list(): Promise<Folder> {
    return await this.storage.list(this.getStorageListParams())
  }

  /**
   * get the inflater associated with the given item type
   * 
   * inflaters convert a generic DocumentItem to a custom DocumentItem
   * @param type 
   * @returns 
   */
  getInflater<D extends Document<DT,DI>>(type: DT): DocumentInflater<D,DT,DI> {
    if (!(type in this.inflaters)) {
      throw new Error("no inflater found for type: "+type)
    }
    return this.inflaters[type] as any // this as-any hurts, but faith in the implementers needs to happen somewhere
  }

  private async computeNewHashIfNecessary(document: Document<DT, DI>): Promise<string | undefined> {
    const cachedHash = this.getCached(document.type, document.relativePath)?.hash;
    if (!isDef(cachedHash)) {
      return undefined
    }
    const newContent = this.serializer.serialize(document)
    const newHash = await this.serializer.computeHash(newContent)
    return newHash !== cachedHash ? newHash : undefined
  }

  private getCached<T extends DT, I extends DI>(type: T, relativePath: string): DocumentCacheEntry<T, I> | undefined {
    return this.documentCache.getEntry(type, relativePath)
  }

  private getItemTypes<T extends DT, I extends DI>(type:T):I[] {
    return this.getInflater<Document<T,I>>(type).itemTypes as I[]
  }

  private getStorageParams<T extends DT, I extends DI>(type:T, itemTypes:I[], relativePath: string): DocumentStorageParams<DT,DI,T,I> {
    return {
      type,
      itemTypes,
      model: this,
      basePath: this.basePath,
      relativePath,
      serializer: this.serializer
    }
  }

  private getStorageListParams():DocumentStorageListParams<DT,DI> {
    return {
      basePath: this.basePath,
      serializer: this.serializer
    }
  }
}

/**
 * A function that returns an appropriate model class when the basePath changes
 */
export type ModelFactory<DT extends string, DI extends string> = (basePath:string) => Model<DT,DI>

/* *********************************************************************************************************************
 * Internal utility classes
********************************************************************************************************************* */

class DocumentCache<DT extends string, DI extends string> {
  readonly cache = {} as Record<DT, Record<string, DocumentCacheEntry<DT, DI>>>;

  getTypeCache<T extends DT, I extends DI>(type: T): Record<string, DocumentCacheEntry<T, I>> {
    return this.cache[type] as Record<string, DocumentCacheEntry<T,I>>
  }

  getEntry<T extends DT, I extends DI>(type: T, relativePath: string): DocumentCacheEntry<T, I> | undefined {
    const typeCache = this.getTypeCache<T, I>(type)
    return isDef(typeCache) ? typeCache[relativePath] : undefined
  }

  setEntry(hash: string, document: Document<DT, DI>): void {
    if (!(document.type in this.cache)) {
      this.cache[document.type] = {}
    }
    const typeCache = this.getTypeCache(document.type)
    typeCache[document.relativePath] = { hash, document }
  }
}

interface DocumentCacheEntry<DT extends string, DI extends string> {
  hash: string
  document: Document<DT, DI>
}
