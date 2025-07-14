import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Document } from "../document";
import { DocumentStorage, DocumentStorageListParams, DocumentStorageParams, Folder } from "../storage";

export class LocalDocumentStorage<A extends string> implements DocumentStorage<A> {
  getPath(basePath:string,relativePath:string):string {
    return path.join(basePath, relativePath)
  }

  async read<T extends A, I extends A>({type,itemTypes,basePath,relativePath,serializer}:DocumentStorageParams<A,T,I>): Promise<Document<T,I>> {
    const filePath = this.getPath(basePath,relativePath)
    // TODO error handling
    const contents = await readFile(filePath, "utf-8");
    return serializer.deserialize(type, itemTypes, contents, relativePath)
  }

  async write<T extends A, I extends A>({serializer,basePath,relativePath}:DocumentStorageParams<A,T,I>, document: Document<T, I>): Promise<void> {
    const contents = serializer.serialize(document)
    const filePath = this.getPath(basePath,relativePath)
    await writeFile(filePath, contents, "utf-8");
  }

  list(params: DocumentStorageListParams<A>): Promise<Folder> {
    throw new Error("Method not implemented.");
  }
}
