import { Document } from "./document"
import { Model } from "./model";
import { DocumentSerializer } from "./serializer";
/**
 * interface for reading and writing documents to and from permanent storage
 */
export interface DocumentStorage<DT extends string, DI extends string> {
  /**
   * Read a document of models from file (or network, db, etc.).
   * The main way to load models into memory.
   * Implementers are responsible for caching or any other optimizations.
   * @param type the model type of the document
   * @param relativePath the relative path to file (or maybe schema) containing the models to read/load
  */
  read<T extends DT, I extends DI>(params: DocumentStorageParams<DT,DI,T,I>): Promise<Document<T,I>>

  /**
   * Write a document of models to file (or db, rest API, etc.).
   * The main way to write models to permanent storage.
   * Implementers are responsible for optimizations (i.e. only write if change detected).
   * @param type the model type of the document
   * @param relativePath the relative path to file (or maybe schema) containing the models to read/load
  */
  write(params: DocumentStorageParams<DT,DI>, document: Document<DT, DI>): Promise<void>

  /**
   * Get a representation of the contents of the folder at the given basePath
   * @param params 
   */
  list(params: DocumentStorageListParams<DT,DI>): Promise<Folder>
}

export interface DocumentStorageParams<DT extends string, DI extends string, T extends DT = DT, I extends DI = DI> {
  type: T,
  itemTypes: I[],
  model: Model<DT,DI>
  basePath: string
  relativePath: string
  serializer: DocumentSerializer<DT,DI>
}

export interface DocumentStorageListParams<DT extends string, DI extends string> {
  basePath: string
  serializer: DocumentSerializer<DT,DI>
  recursive?: number|boolean
}

export interface Folder {
  folders: string[]
  documents: string[]
}
