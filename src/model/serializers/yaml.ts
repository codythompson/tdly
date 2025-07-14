import yaml from "yaml"
import { Document } from "../document";
import { DocumentSerializer } from "../serializer";

export class YamlGenericSerializer<A extends string> extends DocumentSerializer<A> {

  serialize(document: Document<A,A>): string {
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
