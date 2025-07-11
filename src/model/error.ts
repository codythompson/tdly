import { isDef } from "../util/type"

export interface DocumentFormatErrorParams {
  errorName?:string
  serializerName?:string
  documentType?:string
  relativePath?:string
  message?:string
  originalError?:Error
}

export class DocumentFormatError extends Error {
  constructor(readonly params:DocumentFormatErrorParams = {}) {
    super(DocumentFormatError.toMessage(params))
  }

  static toMessage(params:DocumentFormatErrorParams = {}):string {
    const {errorName=this.name,serializerName,documentType,relativePath,message} = params
    const msgar = [errorName,serializerName,documentType,relativePath,message]
      .filter(m => isDef(m))
    return "["+msgar.join("]")
  }

  static paramDefaults(defaults:DocumentFormatErrorParams, given:DocumentFormatErrorParams):DocumentFormatErrorParams {
    return {
      ...defaults,
      ...given
    }
  }
}

export class ItemWrongTypeError extends DocumentFormatError { }
export class ItemMissingNameError extends DocumentFormatError { }
export class DocumentMissingRelativePathError extends DocumentFormatError { }
export class DocumentMissingItemsError extends DocumentFormatError { }
