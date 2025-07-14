import { Document, DocumentItem, DocumentItemType } from "@model/document"
import { Taggable } from "./tag"
import { DocumentInflater, DocumentItemInflater } from "@model/inflater"
import { Model } from "@model/model"
import { ItemPropertyMap, SimpleTypeMap } from "@model/properties"

export const ListType = "List"
export type ListType = typeof ListType
export const ItemType = "Item"
export type ItemType = typeof ItemType

export interface List extends Document<ListType, ItemType>, Taggable<ListType> { }

export class ListDocumentInflater extends DocumentInflater<List> {
  readonly type = ListType

  constructor() {
    super([
      new ItemInflater(),
    ])
  }

  inflateDocument<A extends string>(_: Model<A>, document: Document<ListType, ItemType>, props:ItemPropertyMap): List {
    return {
      ...document,
      tags: props.forceGet<string[]|undefined>("props") ?? []
    }
  }
}

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
}

// export class List

export class ItemInflater extends DocumentItemInflater<Item> {
  type = ItemType
  propertySchema = {
    guid: {type:"string", required:true},
    content: {type:"string", required:true},
    tags: {type:"array", children:"string"},
  } as SimpleTypeMap

  inflateItem<A extends string>(_: Model<A>, item: DocumentItem<ItemType>): Item {
    const properties = this.parseProperties(item)
    const guid = properties.forceGet<string>("guid")
    const content = properties.forceGet<string>("content")
    const tags = properties.forceGet<string[]|undefined>("tags") ?? []

    return {
      ...item,
      guid,
      content,
      tags
    }
  }
}
