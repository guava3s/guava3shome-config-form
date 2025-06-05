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
import type {InternalProps} from "guava3shome-h5-utils/dist/Context";

interface ConfigRationalConverter {
    required: (field: keyForString<MetaConfig>, required: RequiredDescValidator | boolean) => Required<RequiredDescValidator>
    validator: (field: keyForString<MetaConfig>, validator?: ValidateFunction | InputValidator) => Required<InputValidator> | null
    options: (field: keyForString<MetaConfig>, options?: MetaOptionConfig[] | ((field: keyForString<MetaConfig>) => Promise<MetaOptionConfig[]>)) => Promise<MetaOptionConfig[]>
}

export function configConvert(props: InternalProps) {
    const configRationalConverter: ConfigRationalConverter = {
        required: (field: keyForString<MetaConfig>, required: RequiredDescValidator | boolean): Required<RequiredDescValidator> => {
            const message = `The '${field}' value cannot be empty.`;
            if (typeof required === "boolean") {
                return {
                    value: required,
                    message,
                    immediate: props.immediate,
                    failClass: props.failClass
                }
            }
            return {
                value: required.value ?? true,
                immediate: required.immediate ?? props.immediate,
                message: required.message ?? message,
                failClass: required.failClass || props.failClass
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
                        scope: TriggerScope.single,
                        failClass: props.failClass
                    }
                } else {
                    errorValidate(field, validator)
                    return {
                        validate: validator.validate,
                        triggerType: validator.triggerType ?? TriggerType.change,
                        triggerDelay: validator.triggerDelay ?? (validator.triggerType === TriggerType.change ? 200 : 0),
                        immediate: validator.immediate ?? props.immediate,
                        scope: validator.scope ?? TriggerScope.single,
                        failClass: validator.failClass || props.failClass
                    }
                }
            }
            return null
        },
        options: async (field: keyForString<MetaConfig>, options?: MetaOptionConfig[] | ((field: keyForString<MetaConfig>) => Promise<MetaOptionConfig[]>)): Promise<MetaOptionConfig[]> => {
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
            const converterKey = key as keyof ConfigRationalConverter
            result[converterKey] = deepClone(configRationalConverter[converterKey]?.(field, value) ?? value)
            return result
        }, {} as { [key in keyof RunTimeMetaKeyConfig]: any })
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
        this.name = "ConfigRationalityError"
    }
}

export class SimilarRationalityError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "SimilarRationalityError"
    }
}
