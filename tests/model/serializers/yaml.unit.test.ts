import { describe, expect, it } from "vitest";
import { YamlGenericSerializer } from "../../../src/model/serializers/yaml";
import { readFileSync } from "fs";
import path from "path";

const exampleDataBase = path.resolve(__dirname, "../../data")
const exampleList = readFileSync(exampleDataBase+"/examplelist.yml", "utf-8");

describe("yaml serializer tests", () => {
  describe("base serializer", () => {
    it("should desrialzie basic todo yaml files to generic documents", () => {
      // ARRANGE
      const serializer = new YamlGenericSerializer("List", ["Item"])

      // ACT
      const result = serializer.deserialize(exampleList, "fake/relative");

      // ASSERT
      expect(result).toBeDefined()
      expect(result.type).toBe("List")
      expect(result.items.map(i => i.type)).toEqual(["Item", "Item"])
      expect(result.items.map(i => i.name)).toEqual(["weird", "idk idk"])
    })

    it("should serialize back to its original contents if unedited", () => {
      // ARRANGE
      const serializer = new YamlGenericSerializer("List", ["Item"])
      const result = serializer.deserialize(exampleList, "fake/relative");

      // ACT
      const newText = serializer.serialize(result)

      // ASSERT
      expect(newText).toEqual(exampleList)
    })
  })
})
