import { isOfType, isTyped, Typed } from "@typed/typed";
import { isArr, isStr } from "@typed/guards";
import { DocumentMissingItemsError, DocumentMissingRelativePathError, ItemMissingNameError, ItemMissingTypeError, ItemWrongTypeError } from "./error";
import { ItemProperties } from "./properties";
import { replaceNulls } from "@typed/simple";

/**
 * Represents a list of items. A single document, both from an abstract sense, and maybe
 * from a technical sense (i.e. a file, set, and sort-of like two tables in a 1-* relationship)
 */
export interface Document<T extends string, I extends string> extends DocumentItem<T>, Typed<T> {
  itemTypes: I[]
  relativePath: string
  items: DocumentItem<I>[]
}

export type AllDocumentTypes<D> = D extends Document<infer T, infer I> ? T|I : string
export type DocumentType<D> = D extends Document<infer T, any> ? T : string
export type DocumentItemType<D> = D extends Document<any, infer I> ? I : string | D extends DocumentItem<infer T> ? T : string

/**
 * 
 * @param type 
 * @param itemTypes 
 * @param document 
 * @throws {DocumentMissingRelativePathError}
 * @throws {DocumentMissingItemsError}
 * @returns 
 */
export function validateDocument<T extends string, I extends string>(type: T, itemTypes:I[], document:any): document is Document<T,I> {
  document = replaceNulls(document)
  validateDocumentItem(type, document)
  if (!isStr(document.relativePath) || document.relativePath === "") {
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

  properties: ItemProperties
}
/**
 * 
 * @param type 
 * @param item 
 * @throws {ItemWrongTypeError}
 * @throws {ItemMissingNameError}
 * @returns 
 */
export function validateDocumentItem<T extends string>(type: T|T[], item:any): item is DocumentItem<T> {
  if (!isTyped(item)) {
    throw new ItemMissingTypeError()
  }

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
