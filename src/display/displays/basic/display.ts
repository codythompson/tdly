import { SingleDocumentDisplay } from "@display/display";
import { DisplayableState, HeadingLevel, isUIToken, UIBlock, UIDocument, UIToken } from "@display/displayable";
import { UnexpectedTypeError } from "@typed/error";
import { isDef, isObj, isStr } from "@typed/guards";

export class BasicCLIDisplay extends SingleDocumentDisplay {

  constructor(
    public borders:Record<HeadingLevel|"start"|"end", undefined|string|{top?:string,bot?:string}> = DEFAULT_BORDERS,
    public formatting:Record<DisplayableState, [string,string]> = DEFAULT_FORMATTING
  ) {
    super()
    this.setupInputHandling()
  }

  private setupInputHandling()
  {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setDefaultEncoding("utf8")

    process.stdin.on("data", data => this.handleInput(data))

  }

  private cleanupInputHandling():void
  {
    process.stdin.setRawMode(false)
    process.exit()
  }

  private handleInput(data:Buffer):void
  {
    const str = data.toString();
    this.handleInputKey(str);
  }

  private handleInputKey(char:string):void
  {
    switch (char) {

      case 'q':
      case '\u0003':
        this.cleanupInputHandling()
        break;

      case 'k':
      case '\u001B[A':
        this.events.send({
          type: "up",
          message: char
        })
        break;

      case 'j':
      case '\u001B[B':
        this.events.send({
          type: "down",
          message: char
        })
        break;

      case 'h':
      case '\u001B[D':
        this.events.send({
          type: "left",
          message: char
        })
        break;

      case 'l':
      case '\u001B[C':
        this.events.send({
          type: "right",
          message: char
        })
        break;

      case '\r':
        this.events.send({
          type: "select",
          message: char
        })
        break;
    }

  }

  renderBorder(headingLevel:HeadingLevel|"start"|"end"|undefined=undefined, topOrBot:"top"|"bot"="bot"):string|undefined {
    const isTop = topOrBot === "top"
    let border = isDef(headingLevel) ? DEFAULT_BORDERS[headingLevel] : undefined
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
    const [a="",b=""] = DEFAULT_FORMATTING[state]
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

export const DEFAULT_BORDERS:Record<HeadingLevel|"start"|"end", undefined|string|{top?:string,bot?:string}> = {
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

export const FORMAT_CODE = {
  reset: "\x1b[0m",
  invert: "\x1b[7m"
}

export const DEFAULT_FORMATTING:Record<DisplayableState, [string,string]> = {
  [DisplayableState.selected]: [FORMAT_CODE.invert, FORMAT_CODE.reset]
}
