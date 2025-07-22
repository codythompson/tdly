import { isArr } from "./guards"
import { PrimitiveType, PrimitiveTypeString } from "./simple"
import { isOfType, Typed, TypeOf } from "./typed"

export type OrArrOf<T> = T|(T[])

export function mapToRecord<E, T extends string = string>(arr:E[], idFunc:(e:E)=>T):Record<T,E> {
  return Object.fromEntries(
    arr.map(e => [idFunc(e), e])
  ) as Record<T,E>
}

export function mapToArrays<E, T extends string = string>(arr:E[], idFunc:(e:E)=>T):Record<T,E[]> {
  const arrays = {} as Record<T,E[]>
  arr.forEach((e) => {
    const index = idFunc(e)
    if (!(index in arrays)) {
      arrays[index] = []
    }
    arrays[index].push(e)
  })
  return arrays
}

function getType<T extends string>(typed:Typed<T>):T {
  return typed.type
}

export function toRecord<E extends Typed<string>>(arr:E[]): Record<TypeOf<E>,E> {
  return mapToRecord(arr, getType)
}

export function toArrays<E extends Typed<string>>(arr:E[]): Record<TypeOf<E>,E[]> {
  return mapToArrays(arr, getType)
}

export function contains(arr:PrimitiveType[], value:PrimitiveType):boolean {
  return arr.indexOf(value) >= 0
}

export function isOneOf<T extends string>(strings:T[], value:string):value is T {
  return contains(strings,value)
}

export function ensureArr<T>(value:T|T[]):T[] {
  return isArr(value)? value : [value]
}
