import type {InputValidator, RequiredDescValidator, ValidateFunction} from "../typings/runtime-validate.ts";
import {baseIsEmpty, hasFunction} from "./type-check.ts";
import type {
    keyForString,
    MetaConfig,
    MetaKeyConfig,
    MetaOptionConfig,
    RunTimeMetaKeyConfig
} from "../typings/meta-config.ts";
import {TriggerScope, TriggerType} from "../typings/runtime-validate.ts";
import {deepClone} from "guava3shome-h5-utils/dist/object-util";


export function configConvert(props) {
    const configRationalConverter = {
        required: (field: keyForString<MetaConfig>, required: RequiredDescValidator | boolean): Required<RequiredDescValidator> => {
            const message = `The '${field}' value cannot be empty.`;
            if (typeof required === "boolean") {
                return {
                    value: required,
                    message,
                    immediate: props.immediate
                }
            }
            return {
                value: required.value ?? true,
                immediate: required.immediate ?? props.immediate,
                message: required.message ?? message,
            }
        },
        validator: (field: keyForString<MetaConfig>, validator?: ValidateFunction | InputValidator): Required<InputValidator> | null => {
            if (validator) {
                if (hasFunction(validator)) {
                    return {
                        validate: validator,
                        triggerType: TriggerType.change,
                        triggerDelay: 200,
                        immediate: props.immediate,
                        scope: TriggerScope.single
                    }
                } else {
                    errorValidate(field, validator)
                    validator.triggerType ??= TriggerType.change
                    validator.triggerDelay ??= (validator.triggerType === TriggerType.change ? 200 : 0)
                    validator.immediate ??= props.immediate
                    validator.scope ??= TriggerScope.single
                    return validator
                }
            }
            return null
        },
        options: async (field: keyForString<MetaConfig>, options?: MetaOptionConfig[] | ((field: keyForString<MetaConfig>) => Promise<MetaOptionConfig[]>)): MetaOptionConfig[] | [] => {
            if (options) {
                if (hasFunction(options)) {
                    return await options(field)
                }
            }
            return []
        }
    }
    return (field: keyForString<MetaConfig>, config: MetaKeyConfig): {
        runtimeConfig: RunTimeMetaKeyConfig
        fixed: boolean
    } => {
        const newConfig = Object.entries(config).reduce((result, [key, value]) => {
            result[key] = deepClone(configRationalConverter[key]?.(field, value) ?? value)
            return result
        }, ({} as { [key: string]: any }))
        return {
            runtimeConfig: Object.assign(newConfig, {field}),
            fixed: config.fixed ?? false,
        }
    }
}


export function errorDisplayRequired<T extends {
    display: boolean,
    required: Required<RequiredDescValidator>
    defaultValue?: any
}>(field: string, config: T): void {
    if (!config.display && config.required.value && baseIsEmpty(config.defaultValue)) {
        throw new ConfigRationalityError(`When the 'display' field of '${field}' is true and 'required.value' is false, 'defaultValue' must have a value; Therefore, if necessary, please use 'fixed: true' configuration.`)
    }
}

export function errorValidate<T extends { validate: ValidateFunction }>(field: string, config: T): void {
    if (!config.validate) {
        throw new ConfigRationalityError(`The validator for the '${field}' field must be a function.`)
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
