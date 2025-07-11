export interface Text {
    value:string
    style:Set<TextStyle>
}

export interface TextGroup {
    content: Text[]
    headingLevel: HeadingLevel
}

export interface ListItem {
    marker: string
    value: TextGroup
}

export enum TextStyle {
    NONE = "NONE",
    ITALIC = "ITALIC",
    BOLD = "BOLD",
    UNDERSCORE = "UNDERSCORE",
    STRIKETHROUGH = "STRIKETHROUGH",
}

export type HeadingLevel = 0|1|2|3|4|5|6
