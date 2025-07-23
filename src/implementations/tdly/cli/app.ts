import { Model } from "@model/model";
import { ReadWriteApp } from "../../../display/app";
import { AllDocumentTypes, AllItemTypes, DocumentInflaters } from "../documents";
import { BasicCLIDisplay } from "@display/displays/basic/display";
import { LocalDocumentStorage } from "@model/storage/local";
import { YamlGenericSerializer } from "@model/serializers/yaml";
import { UIDocBuilder } from "@display/docbuilder";
import { DisplayableState } from "@display/displayable";

export class TDLYApp extends ReadWriteApp<AllDocumentTypes, AllItemTypes> {
  cursor = 3

  constructor() {
    super(TDLYApp.makeModel, TDLYApp.makeDisplay(), [])
  }

  protected getState(index:number):DisplayableState|undefined {
    return index === this.cursor? DisplayableState.selected : undefined
  }

  async showDirectory(path:string):Promise<void> {
    this.setBasePath(path)
    const folder = await this.getModel().list()
    const docbuilder = UIDocBuilder.start()
      .addBlock({
        content: ["DIRECTORY"],
        headingLevel: 1
      })
    folder.folders.forEach((v,i) => docbuilder.addToken({content:`${v}/`, state:this.getState(i)}))
    folder.documents.forEach(v => docbuilder.addToken(`${v}`))
    this.displayUIDocument(docbuilder.finish())
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
