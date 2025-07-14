import { type Style, UIDocument, UIBlock, BaseStyles } from "@display/text";

export function alert(title:string, message:string, style:Style=BaseStyles.default):UIDocument {
  const paragraphs = [
    {
      content: title,
      headingLevel: 1,
    },
    message
  ] as UIBlock[]

  return {
    blocks: paragraphs,
    style
  }
}
