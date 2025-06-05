export type ComponentValueType =
    | ((value?: any) => string)   // 对应 String
    | ((value?: any) => number)   // 对应 Number
    | ((value?: any) => boolean)  // 对应 Boolean
    | ((value?: any) => any[])    // 对应 Array
    | ((value?: any) => object);  // 对应 Object

export type ClassValue =
    | string
    | Record<string, boolean>
    | ClassValue[]
    | null
    | undefined
