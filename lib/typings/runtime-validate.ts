import type {MetaKeyComponentProps} from "./meta-config.ts";

export enum TriggerType {
    blur = 'blur',
    change = 'change'
}

export enum TriggerScope {
    item = 'item',
    submit = 'submit'
}

export interface ValidateResult {
    success: boolean
    message: string
}

export interface ValidateResultParams extends ValidateResult {
    mark?: number
}


export interface RequiredDescValidator {
    value: boolean
    message: string
    immediate?: boolean
}

export interface InputValidator {
    validate: (value: any, response: ValidateResultParams, props: MetaKeyComponentProps) => Promise<void>
    triggerType?: TriggerType
    triggerDelay?: number
    immediate?: boolean
    scope?: TriggerScope[]
}
