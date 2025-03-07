import type {ComponentValueType} from "./exhibit-component.ts";
import type {Component} from "@vue/runtime-core";
import type {InputValidator, RequiredDescValidator, ValidateFunction} from "./runtime-validate.ts";
import type {MetaConfigDependency} from "./runtime-dependency.ts";

export type keyForString<T> = Extract<keyof T, string>

// 配置整个活动周期
export interface MetaConfig {
    [field: string]: MetaKeyConfig
}

// 入口接口
export interface MetaKeyConfig {
    // 当fixed为true时，除defaultValue/valueType外的字段全部无效，默认为false
    fixed?: boolean
    title: string
    display: boolean
    required: RequiredDescValidator
    component: MetaConfigComponent
    order: number
    defaultValue?: any
    // 最终提交字段的值类型，与其他端的接口相呼应
    valueType: ComponentValueType
    // 根据组件自定义 final: InputValidator
    validator?: ValidateFunction | InputValidator
    // final: MetaOptionConfig[]
    options?: MetaOptionConfig[] | ((field: keyForString<MetaConfig>) => Promise<MetaOptionConfig[]>)
    readonly dependencies?: MetaConfigDependency[]
}

export interface MetaConfigComponent {
    body: PromiseComponent | Component
    bind?: MetaKeyComponentProps
}

export type PromiseComponent = () => Promise<Component>

export interface MetaKeyComponentProps {
    [key: string]: any
}

export type OmitEdMetaKeyConfig = Omit<MetaKeyConfig, 'dependencies' | 'fixed'>
// final runtime
export type OmitEdMetaKeyConfigWithField = OmitEdMetaKeyConfig & { readonly field: keyForString<MetaConfig> }


export interface MetaOptionConfig {
    [key: string]: string | number
}

export interface DataEffect {
    [masterField: string]: SlaveFieldValueMap[]
}

export interface SlaveFieldValueMap {
    slaveField: string
    slaveValueMap: Record<string, string>[]
}

export type MetaConfigKeyValues = Record<keyForString<MetaConfig>, any>

