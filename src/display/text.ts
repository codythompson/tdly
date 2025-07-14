
// export type UIElementType = "default"|"image"|"button"
// export interface UIElement<T extends string = string> extends Typed<T> {

import { enumish } from "@typed/simple"

export interface UIElement {
    value:string
    style?:Style
    name?:string // if name provided, will element will trigger input events (i.e. selected)
}

export interface UIBlock {
    content: UIElement|string[]|UIElement|string
    headingLevel?: HeadingLevel
    style?:Style
}

export interface UIDocument {
    blocks: (UIBlock|string)[]
    style?:Style
}

export interface StyleDef {
    textStyle?: TextStyle
    type?: BaseStyle
    size?: StyleSize

    // TODO: customProperties: ?
}


export type HeadingLevel = 0|1|2|3|4|5|6

export const BaseStyles = enumish( "default", "primary", "secondary", "tertiary", "info", "warning", "error",)
export type BaseStyle = keyof typeof BaseStyles

export const TextStyles = enumish("none","italic","bold","underscore","strikethrough")
export type TextStyle = keyof typeof TextStyles

export const StyleSizes = enumish("default","small","large")
export type StyleSize = keyof typeof StyleSizes

export type Style = StyleDef|BaseStyle
