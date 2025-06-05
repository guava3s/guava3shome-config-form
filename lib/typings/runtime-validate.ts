import type {MetaKeyComponentProps} from "./meta-config.ts";
import type {ClassValue} from "./exhibit-component.ts";

export enum TriggerType {
    blur = 'blur',
    change = 'change'
}

export enum TriggerScope {
    // 对自身进行校验
    single = 'single',
    // 对所有的值进行校验
    propagation = 'propagation'
}

export interface ValidateResult {
    success: boolean
    message: string
}

export interface ValidateResultParams extends ValidateResult {
    controller?: AbortController | null
    class?: ClassValue
}


export interface RequiredDescValidator {
    value: boolean
    message: string
    // Execute verification immediately after the form is displayed
    immediate?: boolean
    failClass?: ClassValue
}

export type SuccessCallback = (value?: unknown) => void
export type FailCallback = (value: unknown) => void

export type ValidateFunction = (value: any, success: SuccessCallback, fail: FailCallback, bind?: MetaKeyComponentProps) => Promise<void>

export interface InputValidator {
    validate: ValidateFunction
    triggerType?: TriggerType
    triggerDelay?: number
    // Execute verification immediately after the form is displayed
    immediate?: boolean
    scope?: TriggerScope
    failClass?: ClassValue
}

export interface ProcessValidatePermission {
    result: boolean
    attach?: any
}
