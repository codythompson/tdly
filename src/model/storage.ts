import { isDef, isStr } from "../util/type";
import { Document, DocumentItem, Typed } from "./document"
import { Model } from "./model";

/**
 * interface for converting a document and it's contents to and from a string.
 * Used for checking if the cached version of a document has changed.
 * Used by models using text files for permanent storage.
 */
export abstract class DocumentSerializer<T extends string, I extends string> implements Typed<T> {
  abstract type: T
  abstract itemTypes: I[]
  abstract serialize(document: Document<T, I>): string
  abstract deserialize(content: string, relativePath:string): Document<T, I>

  async computeHash(documentOrContent: Document<T, I> | string): Promise<string> {
    const contentStr = isStr(documentOrContent) ? documentOrContent : this.serialize(documentOrContent);
    return DocumentSerializer.computeHash(contentStr);
  }

  async hasChanged(newDocument: Document<T, I> | string, previousHash?: string): Promise<boolean> {
    if (!isDef(previousHash)) {
      return false
    }
    return await this.computeHash(newDocument) === previousHash
  }

  // from claude.ai
  // Using Web Crypto API (modern browsers/Node.js)
  static async computeHash(serialized: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * interface for reading and writing documents to and from permanent storage
 */
export interface DocumentStorage<A extends string> {
  /**
   * Read a document of models from file (or network, db, etc.).
   * The main way to load models into memory.
   * Implementers are responsible for caching or any other optimizations.
   * @param type the model type of the document
   * @param relativePath the relative path to file (or maybe schema) containing the models to read/load
  */
  read<T extends A, I extends A>(params: DocumentStorageParams<A, T, I>): Promise<Document<T, I>>

  /**
   * Write a document of models to file (or db, rest API, etc.).
   * The main way to write models to permanent storage.
   * Implementers are responsible for optimizations (i.e. only write if change detected).
   * @param type the model type of the document
   * @param relativePath the relative path to file (or maybe schema) containing the models to read/load
  */
  write<T extends A, I extends A>(params: DocumentStorageParams<A, T, I>, document: Document<T, I>): Promise<void>
}

export interface DocumentStorageParams<A extends string, T extends A, I extends A> {
  model: Model<A>
  basePath: string
  relativePath: string
  serializer: DocumentSerializer<T, I>
}

/**
 * Converts a generic document item into a custom typed item
 */
export interface DocumentItemInflater<T extends string, D extends DocumentItem<T>> extends Typed<T> {
  inflate<A extends T|string>(model: Model<A>, document:DocumentItem<T>):D
}
