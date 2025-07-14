import { TypeWithExtraWhitespaceError, TypeWithInvalidWhitespaceError } from "./error"
import { isDef, isStr } from "./guards"

export interface Typed<T extends string> {
  type: T
}

export type TypeOf<E> = E extends Typed<infer T> ? T : string;

export function isTyped(typed:any): typed is Typed<string> {
  const _isTyped = isDef(typed) && isStr(typed.type) && typed.type !== ""
  if (_isTyped) {
    AssertCorrectWhitespace(typed.type)
  }
  return _isTyped
}
export function isOfType<T extends string>(type:T, typed:any): typed is Typed<T> {
  return isTyped(typed) && typed.type === type
}

const onlySpaces = /^[ \S]*$/

function AssertCorrectWhitespace(type:string):void {
  if (type.trim() !== type) {
    throw new TypeWithExtraWhitespaceError()
  }
  if (!onlySpaces.test(type)) {
    throw new TypeWithInvalidWhitespaceError()
  }
}

// export function mapTyped<T extends Typed<I>[], I extends string = string> {

// }