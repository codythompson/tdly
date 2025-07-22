import { Model } from "@model/model";
import { ReadWriteApp } from "../../../display/app";
import { AllDocumentTypes, AllItemTypes, DocumentInflaters } from "../documents";
import { BasicCLIDisplay } from "@display/displays/basic/display";
import { LocalDocumentStorage } from "@model/storage/local";
import { YamlGenericSerializer } from "@model/serializers/yaml";

export class TDLYApp extends ReadWriteApp<AllDocumentTypes, AllItemTypes> {
  constructor() {
    super(TDLYApp.makeModel, TDLYApp.makeDisplay(), [])
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
