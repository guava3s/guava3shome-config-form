const hasOwnProperty = Object.prototype.hasOwnProperty

export function containKey<T>(obj: T, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}

export function hasFunction(func: any): func is Function {
    return func && typeof func === 'function'
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
