import { Model, ModelFactory } from "@model/model";
import { Document, DocumentType, DocumentItemType } from "@model/document";
import { Display } from "../display/display";
import { DocumentView } from "./view";
import { isDef } from "../typed/guards";
import { AppError, AppNotReady } from "./error";

export class ReadWriteApp<A extends string> {
  protected activeModel?:Model<A>
  protected readonly views:Record<A, DocumentView<Document<A,A>>>

  constructor(
    readonly modeFactory:ModelFactory<A>,
    readonly display:Display,
    views:DocumentView<Document<A,A>>[]
  ) {
    this.views = Object.fromEntries(
      views.map(v => [v.type,v])
    ) as Record<A, DocumentView<Document<A,A>>>
  }

  /** ******************************************************************************************************************
   * public methods
  ****************************************************************************************************************** **/

  async displayDocument<T extends A>(type:T,relativePath:string):Promise<void> {
    await this.catchAllAsync(() => this._displayDocument(type, relativePath))
  }

  setModel(model:Model<A>):void {
    this.activeModel = model;
  }

  /** ******************************************************************************************************************
   * internal methods
  ****************************************************************************************************************** **/

  protected getModel():Model<A> {
    if (!isDef(this.activeModel)) {
      throw new AppNotReady()
    }
    return this.activeModel
  }

  protected getView<D extends Document<A,A>>(type:A):DocumentView<D> {
    return this.views[type] as DocumentView<D>
  }

  protected async catchAllAsync<T>(action: () => Promise<T>): Promise<T | undefined> {
      try {
        return await action()
      }
      catch (e: any) {
        if (!(e instanceof AppError)) {
          console.error(`[ReadWriteApp.catchAllAsync] Encountered unexpected error: ${e?.message}`)
          console.error(e)
          e = new AppError("Unknown Error", `Encountered unexpected error: ${e?.message}`)
        }
        this.display.displayMessge(e.compile())
      }
  }

  protected async _displayDocument<T extends A>(type:T,relativePath:string):Promise<void> {
    await this.catchAllAsync(async () => {
      const document = await this.getModel().read(type, relativePath);
      const compiled = this.getView(type).compile(document)
      await this.display.display(compiled)
    })
  }
}
