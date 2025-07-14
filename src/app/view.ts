import { UIDocument } from "@display/text";
import { Document } from "@model/document";
import { Typed } from "@typed/typed";

export interface DocumentView<D extends Document<T,I>, T extends string = string, I extends string = string> extends Typed<T> {
  type: T

  compile(document: D):UIDocument
}
