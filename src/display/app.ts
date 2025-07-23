import { Model, ModelFactory } from "@model/model";
import { Document } from "@model/document";
import { Display } from "./display";
import { DocumentView } from "./view";
import { isDef } from "../typed/guards";
import { AppError, AppNotReady } from "./error";
import { UIDocument } from "./displayable";

export class ReadWriteApp<DT extends string, DI extends string> {
  protected activeModel?:Model<DT,DI>
  protected readonly views:Record<DT, DocumentView<Document<DT,DI>>>

  constructor(
    readonly modelFactory:ModelFactory<DT,DI>,
    readonly display:Display,
    views:DocumentView<Document<DT,DI>>[]
  ) {
    this.views = Object.fromEntries(
      views.map(v => [v.type,v])
    ) as Record<DT, DocumentView<Document<DT,DI>>>
  }

  /** ******************************************************************************************************************
   * public methods
  ****************************************************************************************************************** **/

  async displayDocument<T extends DT>(type:T,relativePath:string):Promise<void> {
    await this.catchAllAsync(() => this._displayDocument(type, relativePath))
  }

  async displayUIDocument(document:UIDocument):Promise<void> {
    await this.catchAllAsync(() => this._displayUIDocment(document))
  }

  setBasePath(basePath:string):void {
    const newModel = this.modelFactory(basePath)
    this.setModel(newModel)
  }

  setModel(model:Model<DT,DI>):void {
    this.activeModel = model;
  }

  /** ******************************************************************************************************************
   * internal methods
  ****************************************************************************************************************** **/

  protected getModel():Model<DT,DI> {
    if (!isDef(this.activeModel)) {
      throw new AppNotReady()
    }
    return this.activeModel
  }

  protected getView<D extends Document<DT,DI>>(type:DT):DocumentView<D> {
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
        this.display.push(e.compile())
        await this.display.render();
      }
  }

  protected async _displayDocument<T extends DT>(type:T,relativePath:string):Promise<void> {
    const document = await this.getModel().read(type, relativePath);
    const compiled = this.getView(type).compile(document)
    this.display.push(compiled)
    await this.display.render()
  }

  protected async _displayUIDocment(document:UIDocument):Promise<void> {
    this.display.push(document)
    await this.display.render()
  }
}
