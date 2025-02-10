import {TriggerScope, TriggerType} from "./runtime-validate.ts";

export type ComponentValueType = 'string' | 'number' | 'boolean' | 'base_array'
export type ComponentValue = string | number | boolean | string[] | number[] | boolean[]

export const defaultConfig = {
    title: '',
    display: true,
    required: {
        value: true,
        message: '',
        immediate: true
    },
    order: 1,
    defaultValue: '',
    valueType: 'string',
    componentProps: {
        placeholder: '',
        disable: false,
    },
    verifyPrompt: '',
    validator: {
        triggerType: TriggerType.change,
        delay: 150,
        immediate: false,
        scope: [TriggerScope.item],
        validator: () => {
        }
    },
    component: () => {
    },
    dependencies: [
        {
            depField: '',
            depCondition: 'SOME',
            depValues: [],
            priority: 1,
            reset: {
                title: '',
                display: true,
                required: {
                    value: true,
                    message: '',
                    immediate: true
                },
                order: 1,
                defaultValue: '',
                valueType: 'string',
                componentProps: {
                    placeholder: '',
                    disable: false,
                },
                verifyPrompt: '',
                validator: {
                    triggerType: TriggerType.change,
                    triggerDelay: 150,
                    scope: [TriggerScope.item],
                    immediate: true,
                    validator: () => {
                    }
                },
                component: () => {
                },
            },
        }
    ],
}
