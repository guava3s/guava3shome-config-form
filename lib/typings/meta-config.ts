import type {ComponentValue, ComponentValueType, ExhibitComponent} from "./exhibit-component.ts";

export type MetaDependencyCondition = 'SOME' | 'NOT_IN' | 'ALL'
export type OmitDepMetaKeyConfig = Omit<MetaKeyConfig, 'dependencies'>

export interface MetaConfig {
    [field: string]: MetaKeyConfig
}

export interface MetaKeyConfig {
    id: string
    title: string
    field: string
    display: number
    readonly: number
    type: ExhibitComponent
    required: number
    options?: MetaOptionConfig[]
    placeholder: string
    order: number
    defaultValue?: ComponentValue
    valueType?: ComponentValueType

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


