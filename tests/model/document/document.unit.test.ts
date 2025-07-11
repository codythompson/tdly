import { describe, expect, test } from "vitest";
import { isOfType } from "../../../src/model/document"
import { UnexpectedNullError } from "../../../src/util/type";

describe("document tests", () => {
  describe("generic document typeguards", () => {
    test("type guards", () => {
      expect(isOfType("fake", undefined)).toStrictEqual(false)
      expect(() => isOfType("fake", null)).toThrowError(UnexpectedNullError)
      expect(() => isOfType("fake", {type:null})).toThrowError(UnexpectedNullError)
    })
  })
})
