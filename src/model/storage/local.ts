import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Document } from "../document";
import { DocumentStorage, DocumentStorageListParams, DocumentStorageParams, Folder } from "../storage";

export class LocalDocumentStorage<DT extends string, DI extends string> implements DocumentStorage<DT,DI> {
  getPath(basePath:string,relativePath:string):string {
    return path.join(basePath, relativePath)
  }

  async read<T extends DT, I extends DI>({type,itemTypes,basePath,relativePath,serializer}:DocumentStorageParams<DT,DI,T,I>): Promise<Document<T,I>> {
    const filePath = this.getPath(basePath,relativePath)
    // TODO error handling
    const contents = await readFile(filePath, "utf-8");
    return serializer.deserialize<T,I>(type as T, itemTypes as I[], contents, relativePath)
  }

  async write<T extends DT, I extends DI>({serializer,basePath,relativePath}:DocumentStorageParams<T,I>, document: Document<T, I>): Promise<void> {
    const contents = serializer.serialize(document)
    const filePath = this.getPath(basePath,relativePath)
    await writeFile(filePath, contents, "utf-8");
  }

  list(params: DocumentStorageListParams<DT,DI>): Promise<Folder> {
    throw new Error("Method not implemented.");
  }
}
