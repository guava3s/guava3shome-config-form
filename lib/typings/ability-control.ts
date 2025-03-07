import type {MetaConfigKeyValues} from "./meta-config.ts";

export const ABILITY_VALIDATE = 'validate'
export const ABILITY_DATA_EFFECT = 'dataEffect'
export const ABILITY_RESET_CONFIG = 'resetConfig'

export const OPPORTUNITY_BEFORE = 'before'
export const OPPORTUNITY_PROCESS = 'process'
export const OPPORTUNITY_AFTER = 'after'

export interface ProcessDescriptor {
    order: number
    // 每个opportunity下唯一
    name: string
    process: ProcessBody
    opportunity: 'before' | 'process' | 'after'
}

export interface ProcessResult {
    validate?: {
        changeKeys: { [key: string]: boolean }
        validatePermission: boolean
    },
}

export type ProcessBody = (newValue: MetaConfigKeyValues, previousResult?: object) => object | void

export const OPPORTUNITY_ORDER = {
    'before': 0,
    'process': 1,
    'after': 2
} as const

export class ProcessAbortError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ProcessAbortError"
    }
}
