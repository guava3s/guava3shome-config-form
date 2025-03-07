const hasOwnProperty = Object.prototype.hasOwnProperty

export function containKey<T>(obj: T, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}

export function hasFunction(func: any): func is Function {
    return func && typeof func === 'function'
}

export function hasObject(obj: any): obj is Object {
    return obj && typeof obj === 'object'
}

const replacer = (key: string, value: any) => {
    if (hasFunction(value)) {
        return value.toString()
    }
    return value
}

export function checkObjectIdentical(source: object, target: object): boolean {
    const customStringify = (obj: object) => {
        const replacer = (key: string, value: any) => {
            if (typeof value === 'function') {
                return value.toString();
            }
            return value;
        };

        const deepSort = (input: any): any => {
            if (typeof input !== 'object' || input === null) {
                return input;
            }
            if (Array.isArray(input)) {
                return input.map(deepSort);
            }
            const sortedKeys = Object.keys(input).sort();
            const sortedObj: Record<string, any> = {};
            sortedKeys.forEach(key => {
                sortedObj[key] = deepSort(input[key]);
            });
            return sortedObj;
        };

        const sortedObj = deepSort(obj);
        return JSON.stringify(sortedObj, replacer);
    };

    return customStringify(source) === customStringify(target);
}

type EmptyValue = 0 | undefined | null | '' | [] | Record<string, never>

export function baseIsEmpty(value: unknown): value is EmptyValue {
    if (value === 0 || value === undefined || value === null) {
        return true
    }

    if (typeof value === 'string' && value.trim() === '') {
        return true
    }

    if (Array.isArray(value) && value.length === 0) {
        return true
    }

    if (typeof value === 'object') {
        return Object.keys(value).length === 0
    }

    return false;
}
