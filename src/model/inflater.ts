import { DocumentItem, Typed } from "./document";
import { Model } from "./model";

/**
 * Converts a generic document item into a custom typed item
 */
export interface DocumentItemInflater<T extends string, D extends DocumentItem<T>> extends Typed<T> {
  inflate<A extends T|string>(model: Model<A>, document:DocumentItem<T>):D
}
