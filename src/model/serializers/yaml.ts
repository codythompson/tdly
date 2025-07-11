import yaml from "yaml"
import { Document, validateDocument } from "../document";
import { DocumentSerializer } from "../serializer";

export class YamlGenericSerializer<A extends string> extends DocumentSerializer<A> {

  serialize(document: Document<A,A>): string {
    delete (document as any).relativePath
    return yaml.stringify(document)
  }

  deserialize<T extends A, I extends A>(type:T, itemTypes:I[], content: string, relativePath:string): Document<T, I> {
    let obj:any = yaml.parse(content);
    obj = {
      relativePath,
      ...obj
    }
    validateDocument(type, itemTypes, obj);
    return obj
  }
}
