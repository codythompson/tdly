import { SingleDocumentDisplay } from "@display/display";
import { HeadingLevel, UIBlock, UIDocument, UIToken } from "@display/document";
import { isDef, isObj } from "@typed/guards";

export class BasicCLIDisplay extends SingleDocumentDisplay {
  renderBorder(headingLevel:HeadingLevel|"start"|"end"|undefined=undefined, topOrBot:"top"|"bot"="bot"):string|undefined {
    const isTop = topOrBot === "top"
    let border = isDef(headingLevel) ? borders[headingLevel] : undefined
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

  renderDocument(_: UIDocument, renderedBlocks: string[]): string[] {
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
