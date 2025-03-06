import type {MetaConfig, MetaDependencyCondition, OmitEdMetaKeyConfig} from "./meta-config.ts";

export type DepValues = Array<string | number | boolean>


export interface MetaConfigDependency {
    depField: keyof MetaConfig
    depCondition: MetaDependencyCondition
    depValues: DepValues
    priority: number
    reset: OmitEdMetaKeyConfig
}


export const depConditionMap = {
    'some': (values: DepValues, target: any): boolean => values.includes(target),
    'not_in': (values: DepValues, target: any): boolean => !values.includes(target),
    'all': (values: DepValues, target: any): boolean => {
        let arr = target
        if (!Array.isArray(target)) {
            arr = [target]
        }
        return !arr.every((item: any) => values.includes(item))
    },
}
