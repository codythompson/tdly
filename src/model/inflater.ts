import { Typed } from "@typed/typed";
import { Document, DocumentItem } from "./document";
import { Model } from "./model";
import { toArrays, toRecord } from "@typed/collections";
import { ItemPropertyMap, SimpleTypeMap } from "./properties";

/**
 * Converts a generic document item into a custom typed item
 */
export abstract class DocumentItemInflater<D extends DocumentItem<DI>, DI extends string> implements Typed<DI> {
  abstract type:DI
  readonly propertySchema?:SimpleTypeMap

  abstract inflateItem<T extends string, I extends DI>(model: Model<T,I>, item:DocumentItem<DI>, parsedProperties:ItemPropertyMap):D

  parseProperties(item:DocumentItem<DI>):ItemPropertyMap {
    return new ItemPropertyMap(item.properties, this.propertySchema)
  }
}

/**
 * Converts a generic document into a custom typed item
 */
export abstract class DocumentInflater <
  D extends Document<DT, DI>,
  DT extends string,
  DI extends string
> implements Typed<DT> {
  abstract readonly type:DT
  readonly itemTypes: DI[]
  readonly itemInflaters: Record<DI, DocumentItemInflater<DocumentItem<DI>,DI>>
  readonly propertySchema?:SimpleTypeMap

  constructor(itemInflaters:DocumentItemInflater<DocumentItem<DI>,DI>[]) {
    this.itemInflaters = toRecord(itemInflaters)
    this.itemTypes = itemInflaters.map(i => i.type as DI)
  }

  /**
   * take the given generic document, and items that have already been converted to their non-generic type,
   * and return a document converted to it's non-generic type
   * 
   * AKA inflate the given document using the pre-inflated items provided
   * @param model 
   * @param document 
   * @param inflatedItems 
   */
  abstract inflateDocument(model: Model<string,string>, document:Document<DT,DI>, parsedProperties:ItemPropertyMap, inflatedItems:DocumentItem<DI>[]):D

  inflate(model: Model<DT,DI>, document:Document<DT,DI>):D {
    const items = this.getInflatedItems(model, document)
    const props = new ItemPropertyMap(document.properties, this.propertySchema)
    return this.inflateDocument(model, document, props, items)
  }

  getInflatedItems(model: Model<DT,DI>, document:Document<DT,DI>):DocumentItem<DI>[] {
    const inflaters = document.items.map(i => ({inflater:this.getItemInflater(i.type), i}))
    return inflaters.map(({inflater,i})=> {
      const props = inflater.parseProperties(i)
      return inflater.inflateItem(model, i, props)
    })
  }

  getItemInflater(itemType:DI):DocumentItemInflater<DocumentItem<DI>,DI> {
    return this.itemInflaters[itemType] as any // this as-any hurts, but faith in the implementers needs to happen somewhere
  }

  mapItems(items:DocumentItem<DI>[]):Record<DI,DocumentItem<DI>[]> {
    return toArrays(items)
  }
}

export class GenericDocumentInflater<DT extends string, DI extends string> extends DocumentInflater<Document<DT,DI>,DT,DI> {

  constructor (readonly type: DT, inflators:DocumentItemInflater<DocumentItem<DI>,DI>[]) {
    super(inflators)
    this.type = type
  }

  inflateDocument(_: Model<DT,DI>, document:Document<DT,DI>, __:ItemPropertyMap, items:DocumentItem<DI>[]):Document<DT,DI> {
  // inflateDocument<DD extends Document<DT,DI>>(_: Model<DT,DI>, document: DD, __: ItemPropertyMap, items: DocumentItem<DI>[]): DD {
    return {
      ...document,
      items
    }
  }
}
