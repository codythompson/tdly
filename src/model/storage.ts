import { Document } from "./document"
import { Model } from "./model";
import { DocumentSerializer } from "./serializer";
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
  read<T extends A, I extends A>(params: DocumentStorageParams<A>): Promise<Document<T, I>>

  /**
   * Write a document of models to file (or db, rest API, etc.).
   * The main way to write models to permanent storage.
   * Implementers are responsible for optimizations (i.e. only write if change detected).
   * @param type the model type of the document
   * @param relativePath the relative path to file (or maybe schema) containing the models to read/load
  */
  write<T extends A, I extends A>(params: DocumentStorageParams<A>, document: Document<T, I>): Promise<void>
}

export interface DocumentStorageParams<A extends string> {
  model: Model<A>
  basePath: string
  relativePath: string
  serializer: DocumentSerializer<A>
}
