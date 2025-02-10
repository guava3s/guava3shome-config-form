import type {ComponentValue, ComponentValueType} from "./exhibit-component.ts";
import type {Component} from "@vue/runtime-core";
import type {InputValidator, RequiredDescValidator} from "./runtime-validate.ts";

// 配置整个活动周期
export interface MetaConfig {
    [field: string]: MetaKeyConfig
}

export interface MetaKeyConfig {
    title: string
    display: boolean
    required: RequiredDescValidator
    component: () => Promise<Component>
    componentProps: MetaKeyComponentProps
    order: number
    defaultValue?: ComponentValue
    valueType?: ComponentValueType
    // 根据组件自定义
    validator?: InputValidator
    readonly customOptions?: (field: keyof MetaConfig) => Promise<MetaOptionConfig[]>
    readonly dependencies?: MetaConfigDependency[]
}

export interface MetaKeyComponentProps {
    disable: {
        alias: string
        value: boolean
    } | boolean

    [key: string]: any
}

export type MetaDependencyCondition = 'some' | 'not_in' | 'all'
export type OmitDepMetaKeyConfig = Omit<MetaKeyConfig, 'dependencies'>
export type MetaKeyConfigWithField = OmitDepMetaKeyConfig & { readonly field: Extract<keyof MetaConfig, string> }


export interface MetaOptionConfig {
    name: number
    id?: string
    value?: number
    parentId?: string
    hideData?: string
}

export interface MetaConfigDependency {
    depField: keyof MetaConfig
    depCondition: MetaDependencyCondition
    depValues: string[]
    priority: number
    reset: OmitDepMetaKeyConfig
}

export interface DataEffect {
    [masterField: string]: SlaveFieldValueMap[]
}

export interface SlaveFieldValueMap {
    slaveField: string
    slaveValueMap: Record<string, string>[]
}


