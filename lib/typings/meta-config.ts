import type {ComponentValue, ComponentValueType} from "./exhibit-component.ts";
import type {Component} from "@vue/runtime-core";

export interface MetaConfig {
    [field: string]: MetaKeyConfig
}

export interface MetaKeyConfig {
    title: string
    display: boolean
    required: boolean
    order: number
    defaultValue?: ComponentValue
    valueType?: ComponentValueType
    // 根据组件自定义
    componentProps: MetaKeyComponentProps
    verifyPrompt: string
    readonly component: () => Promise<Component>
    readonly customOptions?: (field: keyof MetaConfig) => Promise<MetaOptionConfig[]>
    readonly dependencies?: MetaConfigDependency[]
}

export interface MetaKeyComponentProps {
    placeholder: string
    options?: MetaOptionConfig[]
    disable: boolean

    [key: string]: any
}

export type MetaDependencyCondition = 'SOME' | 'NOT_IN' | 'ALL'
export type OmitDepMetaKeyConfig = Omit<MetaKeyConfig, 'dependencies'>
export type MetaKeyConfigWithField = OmitDepMetaKeyConfig & { field: Extract<keyof MetaConfig, string> }


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
    reset: MetaKeyConfigWithField
}

export interface DataEffect {
    [masterField: string]: SlaveFieldValueMap[]
}

export interface SlaveFieldValueMap {
    slaveField: string
    slaveValueMap: Record<string, string>[]
}


