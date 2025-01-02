const hasOwnProperty = Object.prototype.hasOwnProperty

export function containKey<T>(obj: T, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}
