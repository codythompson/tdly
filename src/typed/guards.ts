import { UnexpectedNullError, UnexpectedTypeError } from "./error";

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

export function isOptionally<T>(guard:(value:any)=>value is T, value:any):value is T|undefined {
    return !isDef(value) || guard(value)
}

export function isObjWithProp<K extends string,V>(guard:(propValue:any)=>propValue is V, obj:any, propKey:K):obj is {[ix in K]:V} {
    return isObj(obj) && guard((obj as any)[propKey])
}
export function isObjWithOptionalProp<K extends string,V>(guard:(propValue:any)=>propValue is V, obj:any, propKey:K):obj is {[ix in K]?:V} {
    return isObj(obj) && isOptionally(guard, (obj as any)[propKey])
}

export function isArrOf<T>(guard:(element:any)=>element is T,value:any):value is T[] {
    if (!isArr(value)) {
        return false
    }
    for (let e of value) {
        if (!guard(e)) {
            return false
        }
    }
    return true
}

export function assert<T>(guard:(value:any)=>value is T, value:any):value is T {
    if (!guard(value)) {
        throw new UnexpectedTypeError()
    }
    return true
}

