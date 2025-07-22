import { SingleDocumentDisplay, Display } from "@display/display";
import { DefaultHeadingLevel, HeadingLevel, UIBlock, UIBlockContent, UIDocument, UIToken } from "@display/document";
import { ensureArr } from "@typed/collections";
import { isDef, isObj } from "@typed/guards";

export class BasicCLIDisplay extends SingleDocumentDisplay {
  // displayMessge(message: UIDocument): Promise<void> {
  //   return this.display(message)
  // }

  // display(document: UIDocument): Promise<void> {
  //   this.printBorder("start")
  //   this.printBlock(document.blocks)
  //   this.printBorder("end")
  //   return Promise.resolve()
  // }

  renderBorder(headingLevel:HeadingLevel|"start"|"end"=DefaultHeadingLevel, topOrBot:"top"|"bot"="bot"):string|undefined {
    const isTop = topOrBot === "top"
    let border = borders[headingLevel]
    if (isObj(border)) {
      border=border[topOrBot]
    }
    else if (isTop) {
      border = undefined
    }

    if (isDef(border)) {
      return border
    }
  }

  renderBlock(block:UIBlock, renderedContent:string[]):string[] {
      return [this.renderBorder(block.headingLevel, "top"), ...renderedContent, this.renderBorder(block.headingLevel, "bot")]
        .filter(isDef)
  }

  renderDocument(document: UIDocument, renderedBlocks: string[]): string[] {
    return [
      this.renderBorder("start"),
      ...renderedBlocks,
      this.renderBorder("end")
    ]
      .filter(isDef)
  }

  renderToken(token: UIToken | string): string {
    if (isObj(token)) {
      return token.content
    }
    return token
  }

  writeRenderedDocument(lines:string[]):void {
    lines.map(line => console.log(line))
  }
}

const borders:Record<HeadingLevel|"start"|"end", undefined|string|{top?:string,bot?:string}> = {
  start: "||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
  0: "____________________________________________________________________________________________________",
  1: {
    top: "====================================================================================================",
    bot: "===================================================================================================="
  },
  2: "________________________________________________________________________________",
  3: "--------------------------------------------------------------------------------",
  4: "----------------------------------------",
  5: "--------",
  6: "-",
  end: "||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
}
