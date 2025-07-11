import { isStr, isDef } from "../util/type";
import { Document, Typed } from "./document"

/**
 * interface for converting a document and it's contents to and from a string.
 * Used for checking if the cached version of a document has changed.
 * Used by models using text files for permanent storage.
 */
export abstract class DocumentSerializer<T extends string, I extends string> implements Typed<T> {
  abstract type: T
  abstract itemTypes: I[]
  abstract serialize(document: Document<T, I>): string
  abstract deserialize(content: string, relativePath:string): Document<T, I>

  async computeHash(documentOrContent: Document<T, I> | string): Promise<string> {
    const contentStr = isStr(documentOrContent) ? documentOrContent : this.serialize(documentOrContent);
    return await DocumentSerializer.computeHash(contentStr);
  }

  async hasChanged(newDocument: Document<T, I> | string, previousHash?: string): Promise<boolean> {
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
