import { Item, ItemType, List, ListDocumentInflater, ListType as ListTypeStr, type ListType } from "./list"
import { State, StateGraph, StateGraphType, StateType } from "./state"
import { Tag, type TagType } from "./tag"

export const DocumentInflaters = {
  [ListTypeStr]: ListDocumentInflater
}

export type DocumentTypes = {
  [ListType]: List,
  [ItemType]: Item,
  [TagType]: Tag,
  [StateType]: State,
  [StateGraphType]: StateGraph
}

export type AllDocumentTypes = keyof DocumentTypes
