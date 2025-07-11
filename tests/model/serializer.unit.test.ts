import { describe, expect, it } from "vitest";
import { DocumentSerializer } from "../../src/model/serializer";
import { Document, DocumentItem } from "../../src/model/document";

class TestSerializer extends DocumentSerializer<"List","Item"> {
  readonly type = "List";
  itemTypes = ["Item"] as "Item"[];

  serialize({relativePath,...document}: Document<"List", "Item">): string {
    return JSON.stringify(document)
  }
  deserialize(content: string, relativePath: string): Document<"List", "Item"> {
    const obj = JSON.parse(content)
    obj.relativePath = relativePath
    return obj
  }
}

describe("DocumentSerializer unit tests", () => {
  describe("hasChanged", () => {
    it("should correctly detect changes", async () => {
      // UTILITY
      const serializer = new TestSerializer()
      async function doStuff(doc:Document<"List","Item">): Promise<{serialized:string,hashFromStr:string,hashFromObj:string,deserialized:Document<"List","Item">}> {
        const serialized = serializer.serialize(doc)
        return {
          serialized,
          hashFromStr: await serializer.computeHash(serialized),
          hashFromObj: await serializer.computeHash(doc),
          deserialized: serializer.deserialize(serialized, doc.relativePath)
        }
      }
      function makeItem(name:string):DocumentItem<"Item"> {
        return {type:"Item", properties:{}, name}
      }

      // ARRANGE
      const originalDoc = {type:"List",name:"idk",relativePath:"something", properties:{},items:[]} as Document<"List","Item">
      const originalDocWItems = {...originalDoc, items: [makeItem("one"),makeItem("two")]}
      const changedDoc = {...originalDoc, name:"diff name"}
      const changedDocWItems = {...changedDoc, items: [makeItem("one"),makeItem("two")]}
      const docWChangedItems = {...originalDoc, items: [makeItem("eh"),makeItem("bee")]}
      const docWNewItems = {...originalDocWItems, items: [makeItem("one"),makeItem("bee"),makeItem("3")]}

      const ogStuff = await doStuff(originalDoc)
      const ogWItemsStuff = await doStuff(originalDocWItems)
      const changedStuff = await doStuff(changedDoc)
      const changedStuffWItems = await doStuff(changedDocWItems)
      const docWChangedItemsStuff = await doStuff(docWChangedItems)
      const docWNewItemsStuff = await doStuff(docWNewItems)
      const changedStuffs = [ogWItemsStuff, changedStuff, changedStuffWItems, docWChangedItemsStuff, docWNewItemsStuff]

      // ASSERT
      expect(await serializer.hasChanged(ogStuff.serialized, ogStuff.hashFromObj)).toBe(false)
      expect(await serializer.hasChanged(originalDoc, ogStuff.hashFromObj)).toBe(false)
      expect(await serializer.hasChanged(ogStuff.serialized, ogStuff.hashFromStr)).toBe(false)
      expect(await serializer.hasChanged(originalDoc, ogStuff.hashFromStr)).toBe(false)

      for (let stuff of changedStuffs) {
        expect(await serializer.hasChanged(stuff.serialized, stuff.hashFromObj)).toBe(false)
        expect(await serializer.hasChanged(originalDoc, stuff.hashFromStr)).toBe(true)
      }
    })
  })
})
