import { Document, DocumentItem } from "@model/document"
import { Taggable } from "./tag"
import { DocumentInflater, DocumentItemInflater } from "@model/inflater"
import { Model } from "@model/model"
import { ItemPropertyMap, SimpleTypeMap } from "@model/properties"
import { DocumentView } from "@display/view"
import { UIBlock, UIDocument } from "@display/displayable"
import { UIDocBuilder } from "@display/docbuilder"

export const ListType = "List"
export type ListType = typeof ListType
export const ItemType = "Item"
export type ItemType = typeof ItemType

export interface List extends Document<ListType, ItemType>, Taggable<ListType> {
  items: Item[]
}

export class ListDocumentInflater extends DocumentInflater<List,ListType,ItemType> implements DocumentView<List> {
  readonly type = ListType

  constructor() {
    super([
      new ItemInflater(),
    ])
  }
  inflateDocument(_: Model<any,any>, document: Document<ListType, ItemType>, props:ItemPropertyMap): List {
    return {
      ...document,
      tags: props.forceGet<string[]|undefined>("props") ?? []
    } as List
  }

  compileItem(item:Item):UIBlock {
    return UIDocBuilder.UIBlock({
      content: [
        UIDocBuilder.UIBlock({content: [item.name], headingLevel: 2}),
        item.content
      ]
    })
  }

  compile(list: List): UIDocument {
    return UIDocBuilder.UIDocument([
      UIDocBuilder.UIBlock({headingLevel:1, content: [list.name]}),
      ...list.items.map(i => this.compileItem(i))
    ])
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

export class ItemInflater extends DocumentItemInflater<Item,ItemType> {
  readonly type = ItemType
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
