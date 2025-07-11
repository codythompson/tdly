import { describe, expect, it, should } from "vitest";
import { YamlGenericSerializer } from "../../../src/model/serializers/yaml/yaml";
import { readFileSync } from "fs";
import path from "path";
import os from "os"
import { replaceNulls } from "../../../src/util/type";

describe("yaml serializer tests", () => {
  describe("base serializer", () => {
    it("should desrialzie basic todo yaml files to generic documents", () => {
      const serializer = new YamlGenericSerializer("List", ["Item"])
      const text = readFileSync(path.resolve(__dirname, "../../data/examplelist.yml"), "utf-8");

      const result = serializer.deserialize(text, "fake/relative");
      expect(result).toBeDefined()
    })
  })
})
