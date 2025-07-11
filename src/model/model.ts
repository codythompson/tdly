import { isDef } from "../util/type"
import { Document, DocumentItem } from "./document"
import { DocumentItemInflater } from "./inflater"
import { DocumentSerializer } from "./serializer"
import { DocumentStorage, DocumentStorageParams } from "./storage"

/**
 * An abstract representation of the todo list app's data model.
 * Consists of documents and document items.
 *
 * Has read and write methods for documents.
 * The documents are defined by the serializers given to the constructor.
 * The storage "engine" is defined by the documentStorage instance given to the constructor.
 */
export abstract class Model<A extends string> {
  readonly documentCache = new DocumentCache<A>()
  readonly storage: DocumentStorage<A>
  readonly serializer: DocumentSerializer<A>
  readonly inflaters: Record<A, DocumentItemInflater<A, DocumentItem<A>>>

  /**
   * @param {string} basePath the root directory (or maybe db host in the future) of the data files/base
   * @param serializers serializers for every model/document - required even if the strings are not being stored directly
   *    (i.e. non file based storage)
   */
  constructor(readonly basePath: string, storage: DocumentStorage<A>, serializer: DocumentSerializer<A>, inflaters: DocumentItemInflater<A, DocumentItem<A>>[]) {
    this.storage = storage;
    this.serializer = serializer
    this.inflaters = Object.fromEntries(
      inflaters
        .map(s => [s.type, s])
    ) as Record<A, DocumentItemInflater<A, DocumentItem<A>>>;
  }

  /**
   * Get the document at the given path (can be a key/id in non file based document storage).
   * Attempts to read from in-memory cache first.
   * @param type 
   * @param relativePath 
   * @returns 
   */
  async readGeneric<T extends A, I extends A>(type: T, relativePath: string): Promise<Document<T,I>> {
    const cacheEntry = this.getCached<T, I>(type, relativePath)
    if (isDef(cacheEntry)) {
      return cacheEntry.document
    }

    // if here, no cached version
    const storageParams = this.getStorageParams<T, I>(type, relativePath);
    const document = await this.storage.read<T, I>(storageParams);
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
  async read<T extends A, D extends Document<T,A>>(type:T, relativePath:string):Promise<D> {
    const generic = await this.readGeneric(type, relativePath)
    return this.getInflater<T, D>(type).inflate<A>(this, generic)
  }

  /**
   * Writes the document to permanent storage if the document is different from the version
   * in this model instance's in-memory cache
   * @param document 
   */
  async write(document: Document<A, A>): Promise<void> {
    const newHash = await this.computeNewHashIfNecessary(document);
    if (isDef(newHash)) {
      const storageParams = this.getStorageParams(document.type, document.relativePath);
      this.storage.write(storageParams, document)
      const newDocument = await this.storage.read(storageParams)
      this.documentCache.setEntry(newHash, newDocument)
    }
  }

  /**
   * get the serializer associated with the given document type
   * @param type 
   * @returns 
   */
  // getSerializer<T extends A, I extends A>(type: T): DocumentSerializer<T, I> {
  //   if (!(type in this.serializers)) {
  //     throw new Error("no serializer found for type: "+type)
  //   }
  //   return this.serializers[type] as DocumentSerializer<T, I>
  // }

  /**
   * get the inflater associated with the given item type
   * 
   * inflaters convert a generic DocumentItem to a custom DocumentItem
   * @param type 
   * @returns 
   */
  getInflater<T extends A, D extends DocumentItem<T>>(type: T): DocumentItemInflater<T, D> {
    if (!(type in this.inflaters)) {
      throw new Error("no inflater found for type: "+type)
    }
    return this.inflaters[type] as DocumentItemInflater<T, D>
  }

  private async computeNewHashIfNecessary(document: Document<A, A>): Promise<string | undefined> {
    const cachedHash = this.getCached(document.type, document.relativePath)?.hash;
    if (!isDef(cachedHash)) {
      return undefined
    }
    const newContent = this.serializer.serialize(document)
    const newHash = await this.serializer.computeHash(newContent)
    return newHash !== cachedHash ? newHash : undefined
  }

  private getCached<T extends A, I extends A>(type: T, relativePath: string): DocumentCacheEntry<T, I> | undefined {
    return this.documentCache.getEntry(type, relativePath)
  }

  private getStorageParams<T extends A, I extends A>(type: T, relativePath: string): DocumentStorageParams<A, T, I> {
    return {
      model: this,
      basePath: this.basePath,
      relativePath,
      serializer: this.serializer
    }
  }
}

/* *********************************************************************************************************************
 * Internal utility classes
********************************************************************************************************************* */

class DocumentCache<A extends string> {
  readonly cache = {} as Record<A, Record<string, DocumentCacheEntry<A, A>>>;

  getTypeCache<T extends A, I extends A>(type: T): Record<string, DocumentCacheEntry<T, I>> {
    return this.cache[type] as any as Record<string, DocumentCacheEntry<T, I>>
  }

  getEntry<T extends A, I extends A>(type: T, relativePath: string): DocumentCacheEntry<T, I> | undefined {
    const typeCache = this.getTypeCache<T, I>(type)
    return isDef(typeCache) ? typeCache[relativePath] : undefined
  }

  setEntry(hash: string, document: Document<A, A>): void {
    if (!(document.type in this.cache)) {
      this.cache[document.type] = {}
    }
    const typeCache = this.getTypeCache(document.type)
    typeCache[document.relativePath] = { hash, document }
  }
}

interface DocumentCacheEntry<T extends string, I extends string> {
  hash: string
  document: Document<T, I>
}
