import { assert, isArr, isDef, isStr } from "@typed/guards"
import { Displayable, HeadingLevel, isBaseStyle, isStyleDef, isUIBlock, isUIBlockContent, isUIToken, Style, StyleDef, UIBlock, UIBlockContent, UIDocument, UIToken } from "./document"

export class UIDisplayableBuilder<P extends Displayable|undefined, D extends Displayable> {
  protected _lastAdded:D["content"][number]|undefined

  constructor(readonly parent:undefined|UIDisplayableBuilder<any,NonNullable<P>>, readonly displayable:D) {}

  get lastAdded():D["content"][number] {
    assert(isDef, this._lastAdded)
    return this._lastAdded
  }

  name<S extends UIDisplayableBuilder<P,D> = typeof this>(name:string):S {
    this.displayable.name = name
    return this as any as S
  }

  style<S extends UIDisplayableBuilder<P,D> = typeof this>(style:Style):S {
    this.displayable.style = style
    return this as any as S
  }

  setStyle<K extends keyof StyleDef, V extends StyleDef[K] = StyleDef[K], S extends UIDisplayableBuilder<P,D> = typeof this>(prop:K, value:V):S {
    if (!isDef(this.displayable.style)) {
      this.displayable.style = {}
    }
    else if (isBaseStyle(this.displayable.style)) {
      this.displayable.style = {
        type: this.displayable.style
      }
    }
    this.displayable.style[prop] = value
    return this as any as S
  }

  add<S extends UIDisplayableBuilder<P,D> = typeof this>(...child:(D["content"])):S {
    assert(isArr, this.displayable.content)
    this._lastAdded = child
    return this as any as S
  }

  finish():D {
    return this.displayable
  }

}

export class UIDocBuilder extends UIDisplayableBuilder<undefined,UIDocument> {

  constructor() {
    super(undefined, UIDocBuilder.UIDocument())
  }

  modifyLast():UIBlockBuilder<UIDocument> {
    return new UIBlockBuilder(this, this.lastAdded)
  }

  addBlock(blockStuff:BlockStuff|UIBlock = {}):UIDocBuilder {
    return this.add(UIDocBuilder.UIBlock(blockStuff))
  }

  addToken(tokenStuff:TokenStuff|UIToken) {
    return this.add(UIDocBuilder.UIBlock(UIDocBuilder.UIToken(tokenStuff)))
  }

  static UIDocument(content:UIBlock[] = []):UIDocument {
    return {
      type: "UIDocument",
      content
    }
  }

  static UIBlock(blockStuff:BlockStuff|UIBlock = []):UIBlock {
    const base:UIBlock = {
      type: "UIBlock",
      content: []
    }
    if (isUIBlock(blockStuff)) {
      return blockStuff
    }
    if (isUIBlockContent(blockStuff)) {
      base.content.push(blockStuff)
    }
    else if (isArr(blockStuff)) {
      for (let e of blockStuff) {
        assert(isUIBlockContent, e)
      }
      base.content.push(...blockStuff)
    }
    else {
      return {
        ...base,
        ...blockStuff
      }
    }
    return base
  }

  static UIToken(tokenStuff:TokenStuff|UIToken):UIToken {
    if (isUIToken(tokenStuff)) {
      return tokenStuff
    }
    if (isStr(tokenStuff)) {
      return {
        type: "UIToken",
        content: tokenStuff
      }
    }
    else {
      return {
        type: "UIToken",
        ...tokenStuff,
      }
    }
  }

  static Basic(title:string,...messages:string[]):UIDocument {
    return UIDocBuilder.start()
      .addBlock({content:[title], headingLevel:1})
      .addBlock({content:messages})
      .finish()
  }

  static start():UIDocBuilder {
    return new UIDocBuilder()
  }
}


export class UIBlockBuilder<P extends UIDocument|UIBlock> extends UIDisplayableBuilder<P,UIBlock> {

  modifyLast():UIBlockBuilder<UIBlock>|UIDisplayableBuilder<UIBlock,UIToken> {
    if (isUIBlock(this.lastAdded)) {
      return new UIBlockBuilder(this, this.lastAdded)
    }
    else if (isUIToken(this.lastAdded)){
      return new UIDisplayableBuilder<UIBlock,UIToken>(this, this.lastAdded)
    }
    else {
      throw new Error()
    }
  }

  break<B extends UIDocBuilder|UIBlockBuilder<UIDocument|UIBlock>>():B {
    assert(isDef,this.parent)
    return this.parent as any as B
  }


  heading(level:HeadingLevel):UIBlockBuilder<P> {
    this.displayable.headingLevel = level
    return this
  }

  addBlock(blockStuff:BlockStuff|UIBlock = {}):UIBlockBuilder<P> {
    return this.add(UIDocBuilder.UIBlock(blockStuff))
  }

  addToken(tokenStuff:TokenStuff|UIToken):UIBlockBuilder<P> {
    return this.add(UIDocBuilder.UIBlock(UIDocBuilder.UIToken(tokenStuff)))
  }
}

export type BlockStuff = UIBlockContent|UIBlockContent[]|Partial<Omit<UIBlock,"type">>
export type TokenStuff = string|Partial<Omit<UIToken,"type"|"content">>&Pick<UIToken,"content">
