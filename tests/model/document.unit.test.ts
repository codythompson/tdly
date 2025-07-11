import { describe, expect, it, test } from "vitest";
import { Document, DocumentItem, isOfType, isTyped, validateDocument, validateDocumentItem } from "../../src/model/document"
import { UnexpectedNullError } from "../../src/util/type";
import { DocumentMissingItemsError, DocumentMissingRelativePathError, ItemMissingNameError, ItemMissingTypeError, ItemWrongTypeError, TypeWithExtraWhitespaceError, TypeWithInvalidWhitespaceError } from "../../src/model/error";

const extraWhitespaceTestStrings = [ " sometype", "sometype ", " sometype ", " some type ", "\tsome type", "\nsome type ", "\nsome type\n", "\f\nsome type\n\f", ];
const invalidWhitespaceTestStrings = [ "some\ntype", "some \ntype", "some\rtype", "some\r type", "some\ftype", "some\ttype", "some\n\ftype", "some\f\ntype", "some\n \ftype", "some\f \ntype", ];

describe("document tests", () => {
  describe("generic document typeguards", () => {
    it("should throw UnexpectedNullError", () => {
      // the philosophy here is having two kinds of nullish types causes a lot of headaches
      // the project intends to only use undefined as valid "nullish" values,
      // and treat the existence of nulls as a bug
      expect(() => isTyped(null)).toThrowError(UnexpectedNullError)
      expect(() => isTyped({type:null})).toThrowError(UnexpectedNullError)
      expect(() => isOfType("fake", null)).toThrowError(UnexpectedNullError)
      expect(() => isOfType("fake", {type:null})).toThrowError(UnexpectedNullError)
      expect(() => validateDocumentItem("fake", null)).toThrowError(UnexpectedNullError)
      expect(() => validateDocumentItem("fake", {type:null})).toThrowError(UnexpectedNullError)
    })

    it("should throw TypeWithExtraWhitespaceError", () => {
      for (let type of extraWhitespaceTestStrings) {
        expect(() => isTyped({type})).toThrow(TypeWithExtraWhitespaceError)
        expect(() => isOfType(type, {type})).toThrow(TypeWithExtraWhitespaceError)
        expect(() => validateDocumentItem(type, {type})).toThrow(TypeWithExtraWhitespaceError)
        expect(() => validateDocumentItem(type, {type, name: "ok"})).toThrow(TypeWithExtraWhitespaceError)
      }
    })

    it("should throw TypeWithInvalidWhitespaceError", () => {
      for (let type of invalidWhitespaceTestStrings) {
        expect(() => isTyped({type})).toThrow(TypeWithInvalidWhitespaceError)
        expect(() => isOfType(type, {type})).toThrow(TypeWithInvalidWhitespaceError)
        expect(() => validateDocumentItem(type, {type})).toThrow(TypeWithInvalidWhitespaceError)
        expect(() => validateDocumentItem(type, {type, name: "ok"})).toThrow(TypeWithInvalidWhitespaceError)
      }
    })

    test("isTyped", () => {
      expect(isTyped({})).toBe(false)
      expect(isTyped({type:undefined})).toBe(false)
      expect(isTyped({type:0})).toBe(false)
      expect(isTyped({type:1})).toBe(false)
      expect(isTyped({type:false})).toBe(false)
      expect(isTyped({type:true})).toBe(false)
      expect(isTyped({type:""})).toBe(false)

      expect(isTyped({type:"fake"})).toBe(true)
      expect(isTyped({type:"0"})).toBe(true)
      expect(isTyped({type:"fake", other:"blah"})).toBe(true)
    })

    test("isOfType", () => {
      expect(isOfType("fake", {})).toBe(false)
      expect(isOfType("undefined", {type:undefined})).toBe(false)
      expect(isOfType("0", {type:0})).toBe(false)
      expect(isOfType("1", {type:1})).toBe(false)
      expect(isOfType("false", {type:false})).toBe(false)
      expect(isOfType("true", {type:true})).toBe(false)
      expect(isOfType("", {type:""})).toBe(false)
      expect(isOfType("fake", {type:"different fake"})).toBe(false)
      expect(isOfType("different fake", {type:"fake"})).toBe(false)

      expect(isOfType("fake", {type:"fake"})).toBe(true)
      expect(isOfType("0", {type:"0"})).toBe(true)
      expect(isOfType("fake", {type:"fake", other:"blah"})).toBe(true)
      expect(isOfType("fa-ke", {type:"fa-ke"})).toBe(true)
      expect(isOfType("2fa2ke", {type:"2fa2ke"})).toBe(true)
      expect(isOfType("fa k -e", {type:"fa k -e"})).toBe(true)
    })

    test("validateDocumentItem", () => {
      expect(() => validateDocumentItem("alsofake", {})).toThrow(ItemMissingTypeError)
      expect(() => validateDocumentItem("alsofake", {type:""})).toThrow(ItemMissingTypeError)
      expect(() => validateDocumentItem("alsofake", {type:"difffake", name:"OK"})).toThrow(ItemWrongTypeError)
      expect(() => validateDocumentItem("alsofake", {type:"alsofake"})).toThrow(ItemMissingNameError)
      expect(() => validateDocumentItem(["fake", "alsofake"], {type:""})).toThrow(ItemMissingTypeError)
      expect(() => validateDocumentItem(["alsofake", "fake"], {type:"difffake", name:"OK"})).toThrow(ItemWrongTypeError)
      expect(() => validateDocumentItem(["fake", "alsofake"], {type:"difffake"})).toThrow(ItemWrongTypeError)
      expect(() => validateDocumentItem(["fake", "alsofake"], {type:"alsofake"})).toThrow(ItemMissingNameError)

      expect(validateDocumentItem("fakefake", {type:"fakefake", name:"thingy"})).toBe(true)
      expect(validateDocumentItem("fakefake", {type:"fakefake", name:""})).toBe(true)
      expect(validateDocumentItem(["fa ke"], {type:"fa ke", name:""})).toBe(true)
      expect(validateDocumentItem(["blah", "fakefake2", "blah2"], {type:"fakefake2", name:""})).toBe(true)
      expect(validateDocumentItem(["blah", "blah2", "fakefake3"], {type:"fakefake3", name:""})).toBe(true)
      expect(validateDocumentItem(["blah", "blah2", "fakefake3"], {type:"blah", name:""})).toBe(true)
    })

    test("validateDocument", () => {
      // ARRANGE
      const validEmptyDoc = {
        type: "docfake",
        name: "doc",
        relativePath: "ok",
        items: [] as DocumentItem<"fakefake">[]
      } as Document<"docfake","fakefake">
      const items = {
        valid: { type: "fitem", name: "some item" },
        missingType: { name: "some item" },
        emptyType: { type: "", name: "some item" },
        missingName: { type: "fitem" }
      }
      function withExtras(item:(keyof typeof items)|any):any {
        if (typeof item === "string") {
          item = items[item]
        }
        return {
          ...item,
          otherA: "hey",
          thingy: ["a", 2],
          otherThingy: {
            otherA: 42
          }
        }
      }
      function withType(type:string|undefined, item:(keyof typeof items)|any):any {
        if (typeof item === "string") {
          item = items[item]
        }
        let result = {
          ...items,
          type
        }
        if (type === undefined) {
          delete result.type
        }
        return result
      }
      function makeDoc(...items:any[]):any {
        return {
          ...validEmptyDoc,
          items
        }
      }
      function itemTest(...items:any[]):boolean {
        return validateDocument("docfake", ["fitem", "otheri"], makeDoc(...items))
      }
      function itemTestF(...items:any[]):() => boolean {
        return () => itemTest(...items)
      }

      // ACT and ASSERT
      expect(itemTestF(items.missingType)).toThrow(ItemMissingTypeError)
      expect(itemTestF(items.emptyType)).toThrow(ItemMissingTypeError)
      expect(itemTestF(withExtras(items.missingType))).toThrow(ItemMissingTypeError)
      expect(itemTestF(withExtras(items.valid), withExtras(items.missingType), withExtras(items.valid))).toThrow(ItemMissingTypeError)
      expect(itemTestF(withType("boo", "valid"))).toThrow(ItemWrongTypeError)
      expect(itemTestF(items.missingName)).toThrow(ItemMissingNameError)
      expect(itemTestF(withExtras(items.missingName))).toThrow(ItemMissingNameError)
      expect(itemTestF(items.valid, withExtras(items.missingName))).toThrow(ItemMissingNameError)

      expect(itemTest()).toBe(true)
      expect(itemTest(items.valid)).toBe(true)
      expect(itemTest(items.valid, withExtras(items.valid))).toBe(true)
      expect(itemTest(withExtras(items.valid), withExtras(items.valid), withExtras(items.valid))).toBe(true)

      expect(() => validateDocument("docfake", ["alsofake"], {})).toThrow(ItemMissingTypeError)
      expect(() => validateDocument("docfake", ["alsofake"], {type:""})).toThrow(ItemMissingTypeError)
      expect(() => validateDocument("docfake", ["alsofake"], {type:"difffake", name:"OK"})).toThrow(ItemWrongTypeError)
      expect(() => validateDocument("docfake", ["alsofake"], {type:"docfake"})).toThrow(ItemMissingNameError)

      expect(() => validateDocument("fakers", ["idk"],{type:"fakers",name:"idk"})).toThrow(DocumentMissingRelativePathError)
      expect(() => validateDocument("fakers", ["idk"], { type: "fakers", name: "idk", relativePath: "" })).toThrow(DocumentMissingRelativePathError)
      expect(() => validateDocument("fakers", ["idk"], { type: "fakers", name: "idk", relativePath: "/something" })).toThrow(DocumentMissingItemsError)
    })
  })
})
