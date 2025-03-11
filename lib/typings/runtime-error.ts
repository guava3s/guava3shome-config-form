import type {RequiredDescValidator} from "./runtime-validate.ts";

export function errorDisplayRequired<T extends {
    display: boolean,
    required: RequiredDescValidator
}>(field: string, config: T): void {
    if (!config.display && config.required.value) {
        throw new ConfigRationalityError(`The 'display' and 'required' definitions for the '${field}' field may not be meaningful, so if necessary, use 'fixed: true' configuration.`)
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
