import type {ComponentValue, ComponentValueType, ExhibitComponent} from "./exhibit-component.ts";
import type {Component} from "@vue/runtime-core";

export type MetaDependencyCondition = 'SOME' | 'NOT_IN' | 'ALL'
export type OmitDepMetaKeyConfig = Omit<MetaKeyConfig, 'dependencies'>

export interface MetaConfig {
    [field: string]: MetaKeyConfig
}

export interface MetaKeyConfig {
    readonly id: string
    title: string
    field: string
    display: number
    disable: number
    required: number
    order: number
    metaProps: {
        placeholder: string
        options?: MetaOptionConfig[]
        defaultValue?: ComponentValue
        valueType?: ComponentValueType
        [key: string]: any
    }
    readonly component: () => Promise<Component>
    readonly dependencies?: MetaConfigDependency[]
}

export interface MetaOptionConfig {
    name: number
    id?: string
    value?: number
    parentId?: string
    hideData?: string
}

export interface MetaConfigDependency {
    metaKeyMapId: number
    depField: string
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


