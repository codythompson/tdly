import { isArr, isDef, isStr, replaceNulls, SimpleType } from "../util/type";
import { DocumentMissingItemsError, DocumentMissingRelativePathError, ItemMissingNameError, ItemWrongTypeError } from "./error";

/**
 * Represents a list of items. A single document, both from an abstract sense, and maybe
 * from a technical sense (i.e. a file, set, and sort-of like two tables in a 1-* relationship)
 */
export interface Document<T extends string, I extends string> extends DocumentItem<T>, Typed<T> {
  relativePath: string
  items: DocumentItem<I>[]
}
export function validateDocument<T extends string, I extends string>(type: T, itemTypes:I[], document:any): document is DocumentItem<T> {
  document = replaceNulls(document)
  validateDocumentItem(type, document)
  if (!isStr(document.relativePath)) {
    throw new DocumentMissingRelativePathError()
  }
  if (!isArr(document.items)) {
    throw new DocumentMissingItemsError()
  }
  for (let item of document.items)
  {
    validateDocumentItem(itemTypes, item)
  }
  return true;
}

/**
 * Represents a single item in a list of items that make up a document.
 */
export interface DocumentItem<T extends string> extends Typed<T> {
  name: string

  properties: Record<string,SimpleType>
}
export function validateDocumentItem<T extends string>(type: T|T[], item:any): item is DocumentItem<T> {
  const possibleTypes = isArr(type)? type : [type]
  let foundType = false
  for (let possibleType of possibleTypes) {
    if (isOfType(possibleType, item)) {
      foundType = true
      break;
    }
  }
  if (!foundType) {
    throw new ItemWrongTypeError({
      message: `Expected item with type: ${type}, found ${item?.type}`
    })
  }
  if (!(isStr((item as any).name))) {
    throw new ItemMissingNameError({
      message: `Expected item to have name: ${item.type} name: ${(item as any).name}`
    })
  }
  return true;
}

export interface Typed<T extends string> {
  type: T
}
export function isTyped(typed:any): typed is Typed<string> {
  return isStr(typed?.type)
}
export function isOfType<T extends string>(type:T, typed:any): typed is Typed<T> {
  return isDef(typed) && isStr(typed.type) && typed.type === type
}

