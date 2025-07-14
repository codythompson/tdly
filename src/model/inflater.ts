import { Typed } from "@typed/typed";
import { Document, DocumentType, DocumentItemType, DocumentItem } from "./document";
import { Model } from "./model";
import { toArrays, toRecord } from "@typed/collections";
import { ItemPropertyMap, SimpleTypeMap } from "./properties";

/**
 * Converts a generic document item into a custom typed item
 */
export abstract class DocumentItemInflater<D extends DocumentItem<string>, I extends DocumentItemType<D> = DocumentItemType<D>> implements Typed<I> {
  abstract type:I
  readonly propertySchema?:SimpleTypeMap

  abstract inflateItem<A extends string>(model: Model<A>, item:DocumentItem<I>, parsedProperties:ItemPropertyMap):D

  parseProperties(item:DocumentItem<I>):ItemPropertyMap {
    return new ItemPropertyMap(item.properties, this.propertySchema)
  }
}

/**
 * Converts a generic document into a custom typed item
 */
export abstract class DocumentInflater <
  D extends Document<string, string>,
  T extends DocumentType<D> = DocumentType<D>,
  I extends DocumentItemType<D> = DocumentItemType<D>
> implements Typed<T> {
  abstract readonly type:T
  readonly itemTypes: I[]
  readonly itemInflaters: Record<I, DocumentItemInflater<DocumentItem<I>>>
  readonly propertySchema?:SimpleTypeMap

  constructor(itemInflaters:DocumentItemInflater<DocumentItem<I>>[]) {
    this.itemInflaters = toRecord(itemInflaters)
    this.itemTypes = itemInflaters.map(i => i.type as I)
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
  abstract inflateDocument<A extends string>(model: Model<A>, document:Document<T,I>, parsedProperties:ItemPropertyMap, inflatedItems:DocumentItem<I>[]):D

  inflate<A extends string>(model: Model<A>, document:Document<T,I>):D {
    const items = this.getInflatedItems(model, document)
    const props = new ItemPropertyMap(document.properties, this.propertySchema)
    return this.inflateDocument(model, document, props, items)
  }

  getInflatedItems<A extends I|string>(model: Model<A>, document:Document<T,I>):DocumentItem<I>[] {
    const inflaters = document.items.map(i => ({inflater:this.getItemInflater(i.type), i}))
    return inflaters.map(({inflater,i})=> {
      const props = inflater.parseProperties(i)
      return inflater.inflateItem(model, i, props)
    })
  }

  getItemInflater<DI extends DocumentItem<IT>, IT extends I>(itemType:IT):DocumentItemInflater<DI> {
    return this.itemInflaters[itemType] as any // this as-any hurts, but faith in the implementers needs to happen somewhere
  }

  mapItems(items:DocumentItem<I>[]):Record<I,DocumentItem<I>[]> {
    return toArrays(items)
  }
}

export class GenericDocumentInflater<T extends string, I extends string> extends DocumentInflater<Document<T,I>,T,I> {

  constructor (readonly type: T, inflators:DocumentItemInflater<DocumentItem<I>>[]) {
    super(inflators)
    this.type = type
  }

  inflateDocument<A extends string>(_: Model<A>, document: Document<T, I>, __: ItemPropertyMap, items: DocumentItem<I>[]): Document<T,I> {
    return {
      ...document,
      items
    }
  }
    
  }
