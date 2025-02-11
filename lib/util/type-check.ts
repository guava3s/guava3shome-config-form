const hasOwnProperty = Object.prototype.hasOwnProperty

export const VALUE_TYPE_MAP = {
    'number': (value: any) => Number(value),
    'boolean': (value: any) => Boolean(value),
    'string': (value: any) => String(value ?? ''),
    'base_array': (value: any) => value ?? []
}

export function containKey<T>(obj: T, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}

export function hasFunction(func: any): func is Function {
    return func && typeof func === 'function'
}
