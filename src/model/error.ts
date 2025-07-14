import { isDef, isStr } from "../typed/guards"

const paramNames = [
  "errorName",
  "serializerName",
  "relativePath",
  "documentType",
  "itemType",
  "propertyName",
  "message",
] as const
type ParamKeys = typeof paramNames[number]
export type DocumentFormatErrorParams = {
  [K in ParamKeys]?: string
}
export type DocumentFormatErrorInfo = Map<ParamKeys, string>

export class DocumentFormatError extends Error {
  readonly info:DocumentFormatErrorInfo
  readonly defaults?:DocumentFormatErrorParams

  constructor(paramsOrMessage:DocumentFormatErrorParams|string = {}, message?:string) {
    super()
    this.info = this.toParamMap(paramsOrMessage, message)
    this.message = this.toMessage()
  }

  toMessage():string {
    return `[${[...this.info.values()].join("]")}`
  }

  toParamMap(paramsOrMessage:DocumentFormatErrorParams|string, message?:string):DocumentFormatErrorInfo {
    const params = DocumentFormatError.paramDefaults(paramsOrMessage, this.defaults, message)
    return new Map(paramNames.map(k => [k, params[k]])) as DocumentFormatErrorInfo
  }

  prepend(infoKey:ParamKeys, value:string, separator=".") {
    const existing = this.info.has(infoKey)? separator+this.info.get(infoKey) : ""
    this.info.set(infoKey, value+existing)
  }

  static paramDefaults(given:DocumentFormatErrorParams|string, defaults:DocumentFormatErrorParams={}, message?:string):DocumentFormatErrorParams {
    if (isStr(given) && isStr(message)) {
      throw new Error("Invalid args to paramDefaults, both cant be strings")
    }
    given = isStr(given)? {message:given} : {message:message}
    const errorName=this.name
    return {
      errorName,
      ...defaults,
      ...given
    }
  }
}

export class DocumentMissingRelativePathError extends DocumentFormatError { }
export class DocumentMissingItemsError extends DocumentFormatError { }
export class ItemMissingTypeError extends DocumentFormatError { }
export class ItemWrongTypeError extends DocumentFormatError { }
export class ItemMissingNameError extends DocumentFormatError { }

export class DocumentPropertyError extends DocumentFormatError {}
export class PropertyMissingError extends DocumentPropertyError { }
export class PropertyUnexpectedTypeError extends DocumentPropertyError { }
