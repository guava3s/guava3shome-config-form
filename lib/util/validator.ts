import {ref} from "vue";
import type {MetaConfig, MetaKeyConfig, MetaKeyConfigWithField} from "../typings/meta-config.ts";
import type {RequiredDescValidator, ValidateResult, ValidateResultParams} from "../typings/runtime-validate.ts";
import {TriggerScope, TriggerType} from "../typings/runtime-validate.ts";
import type {InternalContext} from "guava3shome-h5-utils";

const empty_prompt: string = 'The field value cannot be empty.'
let increaseNumber = 0

export default function useComponentValidator({context}: InternalContext) {

    const keyForValidate = ref<Record<keyof MetaConfig, ValidateResultParams>>({})
    const keyForTimer: Record<keyof MetaConfig, number> = {}

    // 默认校验
    function defaultValidate(field: keyof MetaConfig, required: RequiredDescValidator): boolean {
        const fieldValue = context.keyForValues.value[field];
        return (required.value && (!['null', 'undefined', ''].includes(String(fieldValue))))
    }

    function fillValidate(field: Extract<keyof MetaConfig, string>, config: MetaKeyConfig): void {
        config.required.value ??= true
        config.required.immediate ??= true
        config.required.message ??= empty_prompt

        keyForValidate.value[field] = {
            success: config.required.immediate ? defaultValidate(field, config.required) : true,
            message: config.required.message
        }

        if (!config.validator) {
            return
        }
        if (!config.validator.validate) {
            throw new Error("The validator object must have a validate validation function.")
        }

        config.validator.triggerType ??= TriggerType.change
        config.validator.triggerDelay ??= (config.validator.triggerType === TriggerType.change ? 250 : 0)
        config.validator.immediate ??= true
        config.validator.scope ??= [TriggerScope.item]
    }

    async function validateItem(config: MetaKeyConfigWithField): Promise<boolean> {
        const kfV = keyForValidate.value[config.field]
        const defaultSuccess = defaultValidate(config.field, config.required)
        kfV.success = defaultSuccess
        kfV.message = !defaultSuccess ? config.required.message : ''
        if (config.validator && context.keyForValues.value[config.field]) {
            kfV.mark = ++increaseNumber
            const response = JSON.parse(JSON.stringify(kfV))
            Object.defineProperty(response, 'mark', {writable: false})
            await config.validator.validate(context.keyForValues.value[config.field], response, config.componentProps)
            if (response.mark === kfV.mark) {
                Object.assign(kfV, response)
            }
            if (kfV.success) {
                kfV.message = ''
            }
            return kfV.success
        }
        return true
    }

    // 执行校验
    async function processValidate(configList: MetaKeyConfigWithField[]): Promise<boolean> {

        const result = await Promise.all(configList.filter(cl => {
            return cl.validator?.triggerType === TriggerType.change
        }).map(config => {
            return new Promise(async (resolve) => {
                if (keyForTimer[config.field]) {
                    clearTimeout(keyForTimer[config.field])
                }
                if ((config.validator?.triggerDelay || 0) <= 0) {
                    const success = await validateItem(config)
                    resolve(success)
                } else {
                    keyForTimer[config.field] = setTimeout(async () => {
                        const success = await validateItem(config)
                        resolve(success)
                    }, config.validator?.triggerDelay)
                }
            })
        }))

        return !result.includes(false)
    }

    return {
        keyForValidate,
        fillValidate,
        processValidate
    }
}
