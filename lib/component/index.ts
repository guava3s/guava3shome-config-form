import {defineAsyncComponent, h} from 'vue';
import type {VNode} from "@vue/runtime-core";

export const defaultComponentTypeMap = {
    'INPUT': () => import('./G3Input.vue'),
    'INPUT_NUMBER': () => import('./G3Input.vue'),
    'PASSWORD': () => import('./G3Input.vue'),
    'COLOR': () => import('./G3Input.vue'),
    'SELECT_BY_DICT_VALUE': () => import('./G3Input.vue'),
    'SELECT_BY_DICT_MULTI_VALUE': () => import('./G3Input.vue'),
    'SELECT_BY_DICT_VALUE_SORT_NUMBER': () => import('./G3Input.vue'),
    'SELECT_BY_DICT_HIDE_VALUE_SORT_NUMBER': () => import('./G3Input.vue'),
    'SELECT_BY_DICT_ID': () => import('./G3Input.vue'),
    'SELECT_BY_DICT_MULTI_ID': () => import('./G3Input.vue'),
    'CUSTOM_OPTION_SELECT_BY_DICT_VALUE': () => import('./G3Input.vue'),
    'CUSTOM_OPTION_SELECT_BY_ID': () => import('./G3Input.vue'),
    'CUSTOM_OPTION_SELECT_BY_MULTI_ID': () => import('./G3Input.vue'),
    'CUSTOM_OPTION_SELECT_BY_MULTI_VALUE': () => import('./G3Input.vue'),
    'RATE': () => import('./G3Input.vue'),
    'SLIDER': () => import('./G3Input.vue'),
    'RADIO': () => import('./G3Input.vue'),
    'TEXTAREA': () => import('./G3Input.vue'),
    'TREE_CASCADE': () => import('./G3Input.vue'),
    'CUSTOM_OPTION_TREE_CASCADE': () => import('./G3Input.vue'),
    'CHECKBOX': () => import('./G3Input.vue'),
    'TEXTAREA_JSON': () => import('./G3Input.vue'),
    'ARRAY_BY_TAG': () => import('./G3Input.vue'),
}


interface DynamicComponentOptions {
    component: any; // 组件本身
    props?: Record<string, any>; // 普通 props
    modelValue?: any; // v-model 绑定的值
    'onUpdate:modelValue'?: (value: any) => void; // v-model 更新函数
}

export function renderDynamicComponent({
                                           component,
                                           props = {},
                                           modelValue,
                                           'onUpdate:modelValue': updateModelValue,
                                       }: DynamicComponentOptions): VNode {
    const resolvedComponent = typeof component === 'function'
        ? defineAsyncComponent(component) // 异步组件
        : component; // 普通组件

    return h(resolvedComponent, {
        ...props,
        ...(modelValue !== undefined && { modelValue }), // 传递 v-model 的值
        ...(updateModelValue && { 'onUpdate:modelValue': updateModelValue }), // 传递 v-model 的更新函数
    });
}
