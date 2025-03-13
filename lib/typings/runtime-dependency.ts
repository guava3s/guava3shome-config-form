import type {MetaConfig, OmitEdMetaKeyConfig, RunTimeMetaKeyConfig} from "./meta-config.ts";

export type DepValues = Array<string | number | boolean>
export type MetaDependencyCondition = 'some' | 'not_in' | 'all'

export interface MetaConfigDependency {
    depField: keyof MetaConfig
    depCondition: MetaDependencyCondition | ((target: any, values: DepValues) => boolean)
    depValues: DepValues
    priority: number
    reset: OmitEdMetaKeyConfig
}

export interface RuntimeMetaConfigDependency {
    depField: keyof MetaConfig
    depCondition: MetaDependencyCondition | ((target: any, values: DepValues) => boolean)
    depValues: DepValues
    priority: number
    reset: RunTimeMetaKeyConfig
}


export const depConditionMap = {
    'some': (target: any, values: DepValues): boolean => values.includes(target),
    'not_in': (target: any, values: DepValues): boolean => !values.includes(target),
    'all': (target: any, values: DepValues): boolean => {
        let arr = target
        if (!Array.isArray(target)) {
            arr = [target]
        }
        return !arr.every((item: any) => values.includes(item))
    },
}
