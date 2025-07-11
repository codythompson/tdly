import yaml from "yaml"
import { Document, validateDocument } from "../../document";
import { DocumentSerializer } from "../../storage";

export class YamlGenericSerializer<T extends string, I extends string> extends DocumentSerializer<T,I> {
  constructor(readonly type:T, readonly itemTypes:I[]) {
    super();
  }

  serialize(document: Document<T, I>): string {
    return yaml.stringify(document)
  }

  deserialize(content: string, relativePath:string): Document<T, I> {
    let obj:any = yaml.parse(content);
    obj = {
      relativePath,
      ...obj
    }
    validateDocument(this.type, this.itemTypes, obj);
    return obj
  }
}
