export class UnexpectedNullError extends Error {}
export class UnexpectedTypeError extends Error {}

export const PrimitiveTypes = ["string","number","boolean"] as PrimitiveTypeString[];
export type PrimitiveTypeString = "string"|"number"|"boolean";
export type PrimitiveType = string|number|boolean

export type JsonType = null|PrimitiveType|JsonType[]|{[key: string]: JsonType}
export type SimpleType = undefined|PrimitiveType|SimpleType[]|{[key: string]: SimpleType}

/**
 * throw an error if the value is null
 * 
 * the philosophy here is having two kinds of nullish types causes a lot of headaches
 * the project intends to only use undefined as valid "nullish" values,
 * and treat the existence of nulls as a bug
 * @param value 
 * @returns 
 */
export function AssertNotNull<T>(value:T|null|undefined): value is T|undefined {
    if (value === null)
    {
        throw new UnexpectedNullError();
    }
    return true;
}

export function isDef<T>(value:T|null|undefined): value is T
{
    AssertNotNull(value);
    return value !== undefined;
}
isDef.Nullable = function<T>(value:T|null|undefined): value is T
{
    return value !== undefined && value !== null;
}

export function isArr<T = any>(value:any): value is T[] {
    AssertNotNull(value);
    return Array.isArray(value);
}
isArr.Nullable = function<T = any>(value:any): value is T[] {
    return Array.isArray(value);
}

export function isStr(value:any): value is string {
    AssertNotNull(value);
    return typeof value === "string";
}
isStr.Nullable = function isStr(value:any): value is string {
    return typeof value === "string";
}

export function isNum(value:any): value is number {
    AssertNotNull(value);
    return typeof value === "number";
}
isNum.Nullable = function(value:any): value is number {
    return typeof value === "number";
}

export function isBool(value:any): value is boolean {
    AssertNotNull(value);
    return typeof value === "boolean";
}
isBool.Nullable = function(value:any): value is boolean {
    return typeof value === "boolean";
}

export function isObj(value:any): value is object {
    AssertNotNull(value);
    return typeof value === "object";
}
isObj.Nullable = function(value:any): value is object {
    return typeof value === "object";
}

export function isStrArr(value:any): value is string[] {
    if (!isArr(value)) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        if (!isStr(value[i])) {
            return false;
        }
    }
    return true;
}
isStrArr.Nullable = function(value:any): value is string[] {
    if (!isArr.Nullable(value)) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        if (!isStr.Nullable(value[i])) {
            return false;
        }
    }
    return true;
}

export function isPrim(value:any): value is PrimitiveType {
    const type = typeof value
    return (PrimitiveTypes as string[]).indexOf(type) >= 0;
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
