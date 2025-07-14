import { isOneOf } from "@typed/collections"
import { isStr, isDef, isObj, isArr } from "@typed/guards"
import { isOfPrim, PrimitiveType, PrimitiveTypeMap, PrimitiveTypes, PrimitiveTypeString, SimpleType } from "@typed/simple"
import { PropertyUnexpectedTypeError, DocumentPropertyError, PropertyMissingError } from "./error"

export class ItemPropertyMap {
  constructor(
    readonly values: ItemProperties,
    readonly definitions?: SimpleTypeMap
  ) {
    this.validate()
  }

  validate() {
    validateProperties(this.definitions, this.values)
  }

  getDef(key: string|string[]):SimpleTypeMapValue|undefined {
    if (!isDef(this.definitions)) {
      return undefined;
    }
    if (!isArr(key)) {
      key = key.split(".")
    }

    const [first, ...tokens] = key
    let current:SimpleTypeMapValue = this.definitions[first];
    // for (let token of key) {
    for (let _ of key) {
      throw new Error("Multi level property-type-def key lookup not implemented yet")
    }
    return current
  }

  getGeneric(key:string|string[]):SimpleType {
    if (!isArr(key)) {
      key = key.split(".")
    }
    const [first, ...tokens] = key
    let current:SimpleType = this.values[first];
    // for (let token of tokens) {
    for (let _ of tokens) {
      throw new Error("Multi level property key lookup not implemented yet")
    }
    return current
  }

  get<P extends PrimitiveType>(type: PrimitiveTypeString, key:string|string[]) {
    const typeMeta = this.getDef(key)
    if (isDef(typeMeta) && !propIsPrimOfType(type, typeMeta)) {
      throw new Error(`[ItemPropertyMap.get] Invalid property type for the given key: asked for ${key} as ${type}`)
    }
    return this.getGeneric(key) as P
  }

  forceGet<P extends SimpleType>(key:string|string[]):P {
    return this.getGeneric(key) as P
  }
}

export interface ItemProperties {
  [key:string]: SimpleType
}

export type PrimPropMeta = {
  type: PrimitiveTypeString
  required?: boolean
}
export type ObjPropMeta = {
  type: "object"
  children: SimpleTypeMap|"any"
  required?: boolean
}
export type ObjPropMetaTypedChild = {children: SimpleTypeMap}&Omit<ObjPropMeta, "children">
export type ArrPropMeta = {
  type: "array"
  children: SimpleTypeMapValue|"any"
  required?: boolean
}
export type ArrPropMetaTypedChild = {children: SimpleTypeMapValue}&Omit<ArrPropMeta, "children">


export type TypedCollectionPropMeta<CP extends SimpleTypeMapValue|SimpleTypeMap> = {
  children: CP
}

export type SimpleTypeMeta = PrimPropMeta|ObjPropMeta|ArrPropMeta

export type SimpleTypeMapValue = PrimitiveTypeString|SimpleTypeMeta

export type SimpleTypeMap = {
  [index: string]: SimpleTypeMapValue
}

export function isTypeStr(value:SimpleTypeMapValue|string): value is PrimitiveTypeString {
  return isStr(value) && isOneOf(PrimitiveTypes, value)
}

export function isPrimMeta(value:SimpleTypeMapValue):value is PrimPropMeta {
  return isDef(value) && isObj(value) && isTypeStr(value.type)
}

export function isObjMeta(value:SimpleTypeMapValue):value is ObjPropMeta {
  return isDef(value) && isObj(value) && value.type === "object"
}

export function isArrMeta(value:SimpleTypeMapValue):value is ArrPropMeta {
  return isDef(value) && isObj(value) && value.type === "array"
}

export function isPrimProp(value:SimpleTypeMapValue): value is PrimitiveTypeString|PrimPropMeta {
  return isTypeStr(value) || isPrimProp(value)
}

export function arrChildrenTyped(value:ArrPropMeta):value is ArrPropMetaTypedChild {
  return value.children !== "any"
}

export function objChildrenTyped(value:ObjPropMeta):value is ObjPropMetaTypedChild {
  return value.children !== "any"
}

export function isRequiredProp(propDef:SimpleTypeMapValue):boolean {
  return !isTypeStr(propDef) && propDef.required === true
}

export function propIsPrimOfType(expected:PrimitiveTypeString, primProp:SimpleTypeMapValue):boolean {
  if (!isPrimProp(primProp)) {
    return false
  }
  const propType = isTypeStr(primProp)? primProp : primProp.type
  return expected === propType
}

function validateArrayPropertyChildren(propDef:ArrPropMeta, value:SimpleType):void {
  if (!isArr(value)) {
    throw new PropertyUnexpectedTypeError(` expected an array but found ${typeof value}`)
  }
  if (!arrChildrenTyped(propDef)) {
    return
  }
  for (let i = 0; i < value.length; i++) {
    try {
      validatePropertyValue(propDef.children, value[i])
    }
    catch (e) {
      if (e instanceof DocumentPropertyError) {
        e.prepend("propertyName", `[${i}]`)
      }
      throw e
    }
  }
}

function validateObjPropertyChildren(propDef:ObjPropMeta, value:SimpleType):void {
  if (!isObj(value)) {
    throw new PropertyUnexpectedTypeError(` expected an object/record but found ${typeof value}`)
  }
  if (!objChildrenTyped(propDef)) {
    return
  }
  validateProperties(propDef.children, value as ItemProperties)
}

function validatePropertyValue(propDef:SimpleTypeMapValue, value:SimpleType):void {
  if (isPrimProp(propDef)) {
    let typeStr = isTypeStr(propDef)? propDef : propDef.type!
    if (!isOfPrim(typeStr, value)) {
      throw new PropertyUnexpectedTypeError(` expected type: ${typeStr}, found ${typeof value}`)
    }
    // if here, prop is either a number, bool, or string
  }
  else if (isArrMeta(propDef)) {
    validateArrayPropertyChildren(propDef, value)
  }
  else if (isObjMeta(propDef)) {
    validateObjPropertyChildren(propDef, value)
  }
  else {
    throw new DocumentPropertyError("Unexpected prop def encountered - application bug likely");
  }
}

function validateProperty(propDef:SimpleTypeMapValue, properties:ItemProperties, key:string):void {
  if (!(key in properties) || !isDef(properties[key])) {
    if (isRequiredProp(propDef)) {
      throw new PropertyMissingError({ propertyName: key })
    }
    return
  }
  // if here, the property does exist
  try {
    return validatePropertyValue(propDef, properties[key])
  }
  catch (e) {
    if (e instanceof DocumentPropertyError) {
      e.prepend("propertyName", key)
    }
    throw e
  }
}

export function validateProperties(typeDef:SimpleTypeMap|undefined, properties:ItemProperties):void {
  if (!isDef(typeDef)) {
    return
  }
  for (let key in typeDef) {
    validateProperty(typeDef[key], properties, key)
  }
}