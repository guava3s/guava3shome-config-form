import type {RequiredDescValidator} from "./runtime-validate.ts";
import {baseIsEmpty} from "../util/type-check.ts";

export function errorDisplayRequired<T extends {
    display: boolean,
    required: RequiredDescValidator
    defaultValue?: any
}>(field: string, config: T): void {
    if (!config.display && config.required.value && baseIsEmpty(config.defaultValue)) {
        throw new ConfigRationalityError(`When the 'display' field of '${field}' is true and 'required.value' is false, 'defaultValue' must have a value; Therefore, if necessary, please use 'fixed: true' configuration.`)
    }
}

export class ProcessAbortError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ProcessAbortError"
    }
}

export class ConfigRationalityError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ProcessAbortError"
    }
}
