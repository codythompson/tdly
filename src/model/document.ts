import { isArr, isStr, replaceNulls, SimpleType } from "../util/type";
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
// export function isDocument(document:any): document is Document<string,string> {
//   if (!isDocumentItem(document) || !isArr((document as any)?.items)) {
//     return false;
//   }
//   for (let item in (document as any).items) {
//     if (!isDocumentItem(document)) {
//       return false;
//     }
//   }
//   return true;
// }
// export function isDocumentOfType<T extends string, I extends string>(document:any, type:T, itemTypes:I[]): document is Document<T,I> {
//   if (!isDocumentItemOfType(document, type) || !isArr((document as any)?.items)) {
//     return false;
//   }
//   for (let item in (document as any).items) {
//     if (!isDocumentItemOfType(document, itemTypes)) {
//       return false;
//     }
//   }
//   return true;
// }

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

// export function isDocumentItem(item:any): item is DocumentItem<string> {
//   return isStr(item?.name) && isTyped(item) 
// }
// export function isDocumentItemOfType<T extends string>(item:any, types:T|T[]): item is DocumentItem<T> {
//   types = isArr(types)? types : [types] as T[]
//   return isStr(item?.name) && isTyped(item) && types.indexOf((item as any)?.type) >= 0;
// }

export interface Typed<T extends string> {
  type: T
}
export function isTyped(typed:any): typed is Typed<string> {
  return isStr(typed?.type)
}
export function isOfType<T extends string>(type:T, typed:any): typed is Typed<T> {
  return isStr(typed?.type) && typed.type === type
}

