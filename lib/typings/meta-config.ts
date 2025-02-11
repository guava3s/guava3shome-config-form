import type {ComponentValue, ComponentValueType} from "./exhibit-component.ts";
import type {Component} from "@vue/runtime-core";
import type {InputValidator, RequiredDescValidator} from "./runtime-validate.ts";

export type keyForString<T> = Extract<keyof T, string>

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
    options?: MetaOptionConfig[] | ((field: keyForString<MetaConfig>) => Promise<MetaOptionConfig[]>)
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
export type MetaKeyConfigWithField = OmitDepMetaKeyConfig & { readonly field: keyForString<MetaConfig> }


export interface MetaOptionConfig {
    [key: string]: string | number
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


