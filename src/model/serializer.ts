import { SimpleType } from "@typed/simple";
import { isStr, isDef } from "@typed/guards";
import { Document, validateDocument } from "./document"

/**
 * interface for converting a document and it's contents to and from a string.
 * Used for checking if the cached version of a document has changed.
 * Used by models using text files for permanent storage.
 */
export abstract class DocumentSerializer<A extends string> {
  abstract serialize(document: Document<A,A>): string
  abstract deserializeToObject(content: string, relativePath:string): SimpleType

  deserialize<T extends A, I extends A>(type:T, itemTypes:I[], content: string, relativePath:string): Document<T,I> {
    const obj = this.deserializeToObject(content, relativePath)
    return this.validateDocument(type, itemTypes, obj)
  }

  validateDocument<T extends A, I extends A>(type:T, itemTypes:I[], obj:SimpleType): Document<T,I> {
    if (!validateDocument(type, itemTypes, obj)) {
      // this isn't possible, in theory, because validateDocument should always throw when obj is not valid
      throw new Error("bug in validateDocument function")
    }
    return obj
  }

  async computeHash(documentOrContent: Document<A,A> | string): Promise<string> {
    const contentStr = isStr(documentOrContent) ? documentOrContent : this.serialize(documentOrContent);
    return await DocumentSerializer.computeHash(contentStr);
  }

  async hasChanged(newDocument: Document<A,A> | string, previousHash?: string): Promise<boolean> {
    if (!isDef(previousHash)) {
      return false
    }
    const newHash = await this.computeHash(newDocument)
    return newHash !== previousHash
  }

  // from claude.ai
  // Using Web Crypto API (modern browsers/Node.js)
  static async computeHash(serialized: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
