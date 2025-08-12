import { Model } from "@model/model";
import { Document } from "@model/document";
import { ReadWriteApp } from "../../../display/app";
import { AllDocumentTypes, AllItemTypes, DocumentInflaters } from "../documents";
import { BasicCLIDisplay } from "@display/displays/basic/display";
import { LocalDocumentStorage } from "@model/storage/local";
import { YamlGenericSerializer } from "@model/serializers/yaml";
import { UIDocBuilder } from "@display/docbuilder";
import { DisplayableState } from "@display/displayable";
import { Folder } from "@model/storage";
import { isOfType } from "@typed/typed";
import { AppError } from "@display/error";

export class TDLYApp extends ReadWriteApp<AllDocumentTypes, AllItemTypes> {
  busy = false
  cursor = 3
  totalSelectable = 0
  activeDoc?:Folder|Document<AllDocumentTypes, AllItemTypes>

  constructor() {
    super(TDLYApp.makeModel, TDLYApp.makeDisplay(), [])

    this.display.events.on("up", () => this.moveCursor(-1))
    this.display.events.on("down", () => this.moveCursor(1))
    this.display.events.on("select", () => this.selectUnderCursor())
    this.display.events.on("left", () => this.directoryUp())
  }

  isDirMode(activeDoc = this.activeDoc):activeDoc is Folder {
    return isOfType("Folder", activeDoc)
  }

  protected moveCursor(by:number):void {
    if (this.busy) {
      return
    }
    this.busy = true
    let newCursor = this.cursor+by
    this.cursor = Math.max(0, Math.min(this.totalSelectable-1, newCursor))
    this.display.pop()
    this.catchAllAsync(async () => {
      await this.showDirectory(this.activeModel!.basePath)
    })
      .then(() => this.busy = false)
  }

  protected async selectUnderCursor():Promise<void> {
    if (this.busy) {
      return
    }
    this.busy = true

    if (this.isDirMode(this.activeDoc)) {
      const {folders, documents} = this.activeDoc
      if (this.cursor < folders.length)
      {
        const model = this.getModel()
        await this.showDirectory(model.storage.getPath(model.basePath, folders[this.cursor]))
      }
      else if (this.cursor < folders.length + documents.length) {
        await this.displayDocument("List", documents[this.cursor - folders.length])
      }
      else {
        await this.displayUIDocument(new AppError("index out of bounds", `selected an item at an index that is out of bounds`).compile())
      }
    }
    this.busy = false
  }

  protected async directoryUp():Promise<void> {
    if (this.busy || !this.isDirMode()) {
      return
    }
    this.busy = true

    await this.showDirectory(this.getModel().storage.getPath(this.getModel().basePath, ".."))
    this.busy = false
  }

  protected getState(index:number):DisplayableState|undefined {
    return index === this.cursor? DisplayableState.selected : undefined
  }

  async showDirectory(path:string):Promise<void> {
    const notLoaded = !isOfType("Folder", this.activeDoc) || this.getModel().basePath != path
    if (notLoaded)
    {
      this.setBasePath(path)
      this.activeDoc = await this.getModel().list()
    }
    const {folders, documents} = this.activeDoc as Folder
    const docbuilder = UIDocBuilder.start()
      .addBlock({
        content: [`DIRECTORY${this.busy? " <busy>": ""}`, `[h] to go up a level`],
        headingLevel: 2
      })
    this.totalSelectable = folders.length+documents.length
    folders.forEach((v,i) => docbuilder.addToken({content:`${v}/`, state:this.getState(i)}))
    documents.forEach((v,i) => docbuilder.addToken({content:`${v}`, state:this.getState(i+folders.length)}))
    await this.displayUIDocument(docbuilder.finish())
  }

  protected static makeModel(basePath:string):Model<AllDocumentTypes, AllItemTypes> {
    return new Model<AllDocumentTypes,AllItemTypes>(
      basePath,
      new LocalDocumentStorage<AllDocumentTypes,AllItemTypes>(),
      new YamlGenericSerializer(),
      Object.values(DocumentInflaters)
    )
  }

  protected static makeDisplay():BasicCLIDisplay {
    return new BasicCLIDisplay();
  }
}
