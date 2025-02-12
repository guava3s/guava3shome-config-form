import {ref} from "vue";
import type {keyForString, MetaConfig, MetaKeyConfig, MetaKeyConfigWithField} from "../typings/meta-config.ts";
import type {RequiredDescValidator, ValidateResultParams} from "../typings/runtime-validate.ts";
import {TriggerScope, TriggerType} from "../typings/runtime-validate.ts";
import type {InternalContext} from "guava3shome-h5-utils";
import {deepClone} from "guava3shome-h5-utils/dist/object-util";
import {hasFunction} from "./type-check.ts";

const empty_prompt: string = 'The field value cannot be empty.'

export default function useComponentValidator({context}: InternalContext) {

    const keyForValidate = ref<Record<keyForString<MetaConfig>, ValidateResultParams>>({})
    const keyForTimer: Record<keyForString<MetaConfig>, number> = {}

    // 默认校验: return success?
    function defaultValidate(field: keyForString<MetaConfig>, required: RequiredDescValidator): boolean {
        const fieldValue = context.keyForValues.value[field];
        return required.value ? ![null, undefined, ''].includes(fieldValue) : true
    }

    // required 与 validator 相互独立，required < validator
    function fillValidate(field: keyForString<MetaConfig>, config: MetaKeyConfig): void {
        config.required.value ??= true
        config.required.immediate ??= true
        if (config.required.value) {
            config.required.message ??= empty_prompt
        }

        keyForValidate.value[field] = {
            success: config.required.immediate ? defaultValidate(field, config.required) : true,
            message: config.required.message,
        }

        if (!config.validator) {
            return
        }

        if (hasFunction(config.validator)) {
            const validateFunc = config.validator
            config.validator = {validate: validateFunc}
        }

        if (!config.validator.validate) {
            throw new Error("The validator object must have a validate validation function.")
        }


        config.validator.triggerType ??= TriggerType.change
        config.validator.triggerDelay ??= (config.validator.triggerType === TriggerType.change ? 200 : 0)
        config.validator.immediate ??= true
        config.validator.scope ??= [TriggerScope.item, TriggerScope.submit]
    }

    async function validateItem(config: MetaKeyConfigWithField): Promise<boolean> {
        const kfV = keyForValidate.value[config.field]
        const defaultSuccess = defaultValidate(config.field, config.required)
        kfV.success = defaultSuccess
        !defaultSuccess && (kfV.message = config.required.message)
        if (kfV.controller) {
            kfV.controller.abort()
        }
        if (config.validator && context.keyForValues.value[config.field]) {
            kfV.controller = new AbortController()
            try {
                await new Promise((resolve, reject) => {
                    const onAbort = () => {
                        resolve(true)
                        kfV.controller?.signal.removeEventListener('abort', onAbort)
                        kfV.controller = null
                    }
                    kfV.controller?.signal.addEventListener('abort', onAbort)

                    config.validator?.validate(deepClone(context.keyForValues.value[config.field]), resolve, reject, config.componentProps)
                })
                kfV.success = true
            } catch (e) {
                kfV.success = false
                kfV.message = e as string
            }
            if (kfV.success) {
                kfV.message = ''
            }
        }

        return kfV.success
    }

    // 执行change校验
    async function processValidate(configList: MetaKeyConfigWithField[], scope: TriggerScope = TriggerScope.item): Promise<boolean> {
        const result = await Promise.all(
            configList.filter(cl => {
                const validator = cl.validator
                return validator ? validator.triggerType === TriggerType.change && validator.scope?.includes(scope) : true
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
            })
        )

        return !result.includes(false)
    }

    return {
        keyForValidate,
        fillValidate,
        processValidate
    }
}
