import { SingleDocumentDisplay } from "@display/display";
import { DisplayableState, HeadingLevel, isUIToken, UIBlock, UIDocument, UIToken } from "@display/displayable";
import { UnexpectedTypeError } from "@typed/error";
import { isDef, isObj, isStr } from "@typed/guards";

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

  protected formatWrap(state:DisplayableState|undefined, str:string):string {
    if (!isDef(state)) {
      return str
    }
    const [a="",b=""] = formattting[state]
    return `${a}${str}${b}`
  }

  renderToken(token: UIToken | string): string {
    if (isUIToken(token)) {
      return this.formatWrap(token.state, token.content)
    }
    if (isStr(token)) {
      return token
    }
    throw new UnexpectedTypeError()
  }

  writeRenderedDocument(lines:string[]):void {
    console.clear()
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

const formatCode = {
  reset: "\x1b[0m",
  invert: "\x1b[7m"
}

const formattting:Record<DisplayableState, [string,string]> = {
  [DisplayableState.selected]: [formatCode.invert, formatCode.reset]
}
