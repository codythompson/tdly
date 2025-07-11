import { describe, expect, test } from "vitest";
import { isOfType } from "../../../src/model/document"
import { UnexpectedNullError } from "../../../src/util/type";

describe("document tests", () => {
  describe("generic document typeguards", () => {
    test("type guards should throw UnexpectedNullError", () => {
      // the philosophy here is having two kinds of nullish types causes a lot of headaches
      // the project intends to only use undefined as valid "nullish" values,
      // and treat the existence of nulls as a bug
    })
    test("type guards", () => {
      expect(isOfType("fake", undefined)).toStrictEqual(false)
      expect(() => isOfType("fake", null)).toThrowError(UnexpectedNullError)
      expect(() => isOfType("fake", {type:null})).toThrowError(UnexpectedNullError)
    })
  })
})
