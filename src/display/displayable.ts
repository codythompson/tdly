
// export type UIElementType = "default"|"image"|"button"
// export interface UIElement<T extends string = string> extends Typed<T> {

import { contains } from "@typed/collections"
import { isArr, isArrOf, isDef, isObjWithOptionalProp, isObjWithProp, isStr } from "@typed/guards"
import { enumish, isEnumishGuard } from "@typed/simple"
import { isOfType, isTyped, Typed } from "@typed/typed"
import { isSet } from "util/types"

export interface UIToken extends Displayable<"UIToken", string> { }
export function isUIToken(value:any):value is UIToken {
  return isDisplayableOfType("UIToken", isStr, value)
}

/**
 * @todo description of UIBlock
 */
export interface UIBlock extends Displayable<"UIBlock", UIBlockContent[]> {
  headingLevel?: HeadingLevel
}
export function isUIBlock(value:any):value is UIBlock {
  return isDisplayableOfType("UIBlock", isUIBlockContent, value)
}
export type UIBlockContent = string|UIToken|UIBlock
export function isUIBlockContent(value:any):value is string|UIToken|UIBlock {
  if (isStr(value) || isUIToken(value)) {
    return true
  }
  return isUIBlock(value)
}
export type HeadingLevel = 0|1|2|3|4|5|6


/**
 * @todo description of UIDocument
 */
export interface UIDocument extends Displayable<"UIDocument", UIBlock[]> { }
export function isUIDocument(value:any): value is UIDocument {
  return isDisplayableOfType("UIDocument", isUIBlock, value)
}

export interface Knowable {
  name?:string // if name provided, will element will trigger input events (i.e. selected)
}
export function isKnowable(value:any):value is Knowable {
  return isObjWithOptionalProp(isStr, value, "name")
}

export interface StyleDef {
  textStyle?: TextStyle
  type?: BaseStyle
  size?: StyleSize

  // TODO: customProperties: ?
}
export function isStyleDef(value:any):value is StyleDef {
  return isObjWithOptionalProp(isTextStyle, value, "textStyle")
  && isObjWithOptionalProp(isBaseStyle, value, "type")
  && isObjWithOptionalProp(isStyleSize, value, "size")
}

export interface Styleable {
  style?:Style
}
export function isStyleable(value:any):value is Styleable {
  return isObjWithOptionalProp(isStyle, value, "style")
}

export const BaseStyles = enumish( "default", "primary", "secondary", "tertiary", "info", "warning", "error",)
export type BaseStyle = keyof typeof BaseStyles
export function isBaseStyle(value:any):value is BaseStyle {
  return isStr(value) && contains(Object.values(BaseStyles), value)
}

export const TextStyles = enumish("none","italic","bold","underscore","strikethrough")
export type TextStyle = keyof typeof TextStyles
export function isTextStyle(value:any):value is TextStyle {
  return isStr(value) && contains(Object.values(TextStyles), value)
}

export const StyleSizes = enumish("default","small","large")
export type StyleSize = keyof typeof StyleSizes
export function isStyleSize(value:any):value is StyleSize {
  return isStr(value) && contains(Object.values(StyleSizes), value)
}

export type Style = StyleDef|BaseStyle
export function isStyle(value:any):value is Style {
  return isStyleDef(value) || isTextStyle(value)
}

export interface Statable {
  // state?: Set<DisplayableState>
  state?: DisplayableState
}
export function isStatable(value:any): value is Statable {
  return isObjWithOptionalProp(
    // (v => !isDef(v) || (isSet(v) && isArrOf(isEnumishGuard(DisplayableState), [...v]))) as (v:any) => v is Set<DisplayableState>|undefined,
    isEnumishGuard(DisplayableState),
    value,
    "state"
  )
}
export const DisplayableState = enumish("selected") // i.e. hovered, focused?
export type DisplayableState = keyof typeof DisplayableState

export interface Displayable<T extends string = string, C = any> extends Typed<T>, Knowable, Styleable, Statable {
  content: C
}
export function isDisplayable(value:any):value is Displayable<string> {
  return isTyped(value) &&
    isStyleable(value) &&
    isKnowable(value) &&
    isStatable(value) &&
    isObjWithProp(isDef, value, "content")
}
export function isDisplayableOfType<T extends string, C = any>(type:T, contentGuard:(v:any)=>v is C, value:any):value is Displayable<T,C> {
  return isDisplayable(value) &&
    isOfType(type, value) &&
    isObjWithProp(contentGuard, value, "content")
}
