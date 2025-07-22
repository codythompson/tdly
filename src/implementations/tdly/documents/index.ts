import { Item, ItemInflater, ItemType, List, ListDocumentInflater, ListType as ListTypeStr, type ListType } from "./list"
import { State, StateGraph, StateGraphType, StateType } from "./state"
import { Tag, TagsInflater, TagType } from "./tag"

export const DocumentInflaters = {
  [ListTypeStr]: new ListDocumentInflater(),
  // [TagType]: new TagsInflater()
}

export const ItemInflaters = {
  [ItemType]: new ItemInflater(),
}

export type DocumentTypes = {
  [ListType]: List,
  // [TagType]: Tag,
  // [StateType]: State,
  // [StateGraphType]: StateGraph
}

export type ItemTypes = {
  [ItemType]: Item,
}

export type AllDocumentTypes = keyof DocumentTypes
export type AllItemTypes = keyof ItemTypes
