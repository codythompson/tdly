import { isOneOf } from "./collections";
import { UnexpectedTypeError } from "./error";
import { isArr, isBool, isDef, isNum, isObj, isStr } from "./guards";

export const PrimitiveTypes = ["string","number","boolean"] as PrimitiveTypeString[];
export type PrimitiveTypeString = "string"|"number"|"boolean";
export type PrimitiveType = string|number|boolean
export type PrimitiveTypeMap = {
  "string": string
  "number": number
  "boolean": boolean
}
export const PrimitiveTypeGuards = {
  "string": isStr,
  "number": isNum,
  "boolean": isBool,
}

export type JsonType = null|PrimitiveType|JsonType[]|{[key: string]: JsonType}
export type SimpleType = undefined|PrimitiveType|SimpleType[]|{[key: string]: SimpleType}

export function isPrim(value:any): value is PrimitiveType {
    const type = typeof value
    return (PrimitiveTypes as string[]).indexOf(type) >= 0;
}

export function isOfPrim<K extends PrimitiveTypeString, T = PrimitiveTypeMap[K]>(type:K, value:any): value is T {
  return PrimitiveTypeGuards[type](value)
}

export function replaceNulls(value:any): SimpleType {
    if (!isDef.Nullable(value)) {
        return undefined
    }
    if (isPrim(value)) {
        return value;
    }
    if (isArr(value)) {
        return value.map(v => replaceNulls(v))
    }
    if (isObj(value)) {
        return Object.fromEntries(
            Object.entries(value)
                .map(([k, v]) => [k, replaceNulls(v)])
        );
    }
    throw new UnexpectedTypeError();
}

export function enumish<K extends string>(...keys:K[]):Enumish<K> {
    return Object.fromEntries(keys.map(k => [k,k])) as Record<K,K>
}
export type Enumish<K extends string> = Record<K,K>;
export function enumerate<K extends string>(enumish:Enumish<K>):K[] {
    return Object.values(enumish)
}

export function isEnumishGuard<K extends string>(enumish:Enumish<K>):(value:string) => value is keyof Enumish<K> {
    return (value) => isOneOf(enumerate(enumish), value)
}
