import { isDef } from "@typed/guards";
import { EventManager } from "./event";
import { isUIBlock, UIBlock, UIDocument, UIToken } from "./document";

type OrPromise<T> = Promise<T>|T

export interface Display {
  readonly events:EventManager

  clear(): OrPromise<void>
  push(document: UIDocument): void
  pop(): UIDocument|undefined
  render(): OrPromise<void>
}

export abstract class SingleDocumentDisplay<TC = string, BC = TC, DC = BC> implements Display {
  readonly events = new EventManager()

  readonly docStack:UIDocument[] = []

  abstract writeRenderedDocument(renderedDocument:DC[]):OrPromise<void>
  abstract renderDocument(document: UIDocument, renderedBlocks:(BC|TC)[]):DC[]
  abstract renderBlock(block: UIBlock, renderedContent:(BC|TC)[]):(BC|TC)[]
  abstract renderToken(token: UIToken|string):TC

  push(document: UIDocument): void {
    this.docStack.push(document)
  }

  pop(): UIDocument|undefined {
    return this.docStack.pop()
  }

  clear(): OrPromise<void> {
    return this.writeRenderedDocument([]);
  }

  async render(): Promise<void> {
    await this.clear();
    const document = this.docStack[this.docStack.length-1]
    if (!isDef(document)) {
      await this.writeRenderedDocument([])
    }
    const renderedBlocks = [] as (TC|BC)[]
    for (let block of document.content) {
      const blockContent = this.renderBlockContent(block)
      renderedBlocks.push(...this.renderBlock(block, blockContent))
    }
    const renderedLines = this.renderDocument(document, renderedBlocks)
    await this.writeRenderedDocument(renderedLines)
  }

  renderBlockContent(block:UIBlock): (BC|TC)[] {
    const renderedContent = [] as (BC|TC)[]
    for (let element of block.content) {
      if (isUIBlock(element)) {
        const childRenderedContent = this.renderBlockContent(element)
        renderedContent.push(...this.renderBlock(element, childRenderedContent))
      }
      else {
        renderedContent.push(this.renderToken(element))
      }
    }
    return renderedContent
  }
}
