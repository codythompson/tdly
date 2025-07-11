import { Document, DocumentItem } from "../document"
import { Taggable } from "./tag"

export interface List extends Document<ListType, ItemType>, Taggable<ListType> { }

export interface Item extends DocumentItem<ItemType>, Taggable<ItemType> {
   /**
    * @property {string} uuid should be a universally unique id (v4 preferably) so the item can be identified
    *     even if it's order in the list changes, or other items in the same list have the same name
   */
  guid: string

  /**
   * @property {string} content a markdown-ish string?
   */
  content: string

  customProperties: CustomProperty[]
}

export interface CustomProperty {
    name: string
    value: null|string|number|boolean|CustomProperty[]
}

export const ListType = "List"
export type ListType = typeof ListType
export const ItemType = "Item"
export type ItemType = typeof ItemType
