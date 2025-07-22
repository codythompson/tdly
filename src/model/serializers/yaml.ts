import yaml from "yaml"
import { Document } from "../document";
import { DocumentSerializer } from "../serializer";

export class YamlGenericSerializer<DT extends string, DI extends string> extends DocumentSerializer<DT,DI> {

  serialize(document: Document<DT,DI>): string {
    delete (document as any).relativePath
    return yaml.stringify(document)
  }

  deserializeToObject(content: string, relativePath:string): any {
    let obj:any = yaml.parse(content);
    obj = {
      relativePath,
      ...obj
    }
    return obj
  }
}
