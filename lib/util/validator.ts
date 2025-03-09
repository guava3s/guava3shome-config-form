import {ref} from "vue";
import type {
    keyForString,
    MetaConfig,
    MetaConfigKeyValues,
    MetaKeyConfig,
    OmitEdMetaKeyConfigWithField
} from "../typings/meta-config.ts";
import type {
    InputValidator, ProcessValidatePermission,
    RequiredDescValidator,
    ValidateResultParams
} from "../typings/runtime-validate.ts";
import {TriggerScope, TriggerType} from "../typings/runtime-validate.ts";
import type {InternalContext} from "guava3shome-h5-utils";
import {deepClone} from "guava3shome-h5-utils/dist/object-util";
import {baseIsEmpty, hasFunction} from "./type-check.ts";
import {errorDisplayRequired} from "../typings/runtime-error.ts";

/*
校验原则：
    初始化时：
    初始化有值，必校验，无论immediate是为true；
    初始化无值，根据required为true或者validator是否存在，由immediate决定是否校验；

    校验时：
    前提仅对required为true或validator存在的配置项进行校验，可以控制范围；若是validator.scope为propagation，则全部校验；反之仅校验值变化的配置项
 */
const empty_prompt: string = 'The field value cannot be empty.'

export default function useComponentValidator({context, props}: InternalContext) {

    // key对应校验结果信息
    const keyForValidate = ref<Record<keyForString<MetaConfig>, ValidateResultParams>>({})
    const keyForTimer: Record<keyForString<MetaConfig>, number> = {}
    // 上一次表单答案
    const previousKeyForValues: MetaConfigKeyValues = {}
    // 是否触发表单校验依据
    const triggerValidatePermission = {
        forValueChange: (newKeyValues: MetaConfigKeyValues): ProcessValidatePermission => {
            const changeKeys: { [key: string]: boolean } = {}
            for (const key in newKeyValues) {
                const equals = newKeyValues[key] !== previousKeyForValues[key]
                if (props.debug) {
                    console.log('for value change: newKeyValues=', JSON.parse(JSON.stringify(newKeyValues[key])))
                    console.log('for value change: previousKeyForValues=', JSON.parse(JSON.stringify(previousKeyForValues[key])))
                    console.log('for Value change: equals=', equals)
                    console.log('for value change: newKeyValues baseIsEmpty=', baseIsEmpty(newKeyValues[key]))
                    console.log('for value change: previousKeyForValues baseIsEmpty=', baseIsEmpty(newKeyValues[key]))
                }
                if (equals && !(baseIsEmpty(newKeyValues[key]) && baseIsEmpty(previousKeyForValues[key]))) {
                    changeKeys[key] = true
                }
            }
            return {
                result: Object.values(changeKeys).includes(true),
                attach: changeKeys
            }
        }
    }

    // 默认校验: return success?
    function defaultValidate(field: keyForString<MetaConfig>, required: RequiredDescValidator): boolean {
        if (!required.value) {
            return true
        }
        const fieldValue = context.keyForValues.value[field];
        const isInvalid = (value: unknown): boolean => {
            if (value == null) {
                return true;
            }
            if (typeof value === 'string' && !value.trim()) {
                return true;
            }
            if (typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length) {
                return true;
            }
            return Array.isArray(value) && !value.length
        }
        return !isInvalid(fieldValue)
    }


    // required 与 validator 相互独立，required < validator
    function fillValidate(field: keyForString<MetaConfig>, config: MetaKeyConfig): void {
        config.required.value ??= true
        errorDisplayRequired(field, config.display, config.required.value)
        config.required.immediate ??= props.immediate
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
        config.validator.immediate ??= props.immediate
        config.validator.scope ??= TriggerScope.single
    }

    async function validateItem(config: OmitEdMetaKeyConfigWithField): Promise<boolean> {
        const kfV = keyForValidate.value[config.field]
        const defaultSuccess = defaultValidate(config.field, config.required)
        kfV.success = defaultSuccess
        kfV.controller && kfV.controller.abort()
        if (!defaultSuccess) {
            kfV.message = config.required.message
            return kfV.success
        }
        if (config.validator && context.keyForValues.value[config.field]) {
            kfV.controller = new AbortController()
            try {
                await new Promise((resolve, reject) => {
                    const onAbort = () => {
                        reject('ABORT PROMISE')
                        kfV.controller?.signal.removeEventListener('abort', onAbort)
                        kfV.controller = null
                    }
                    kfV.controller?.signal.addEventListener('abort', onAbort);

                    (config.validator as InputValidator).validate(deepClone(context.keyForValues.value[config.field]), resolve, reject, config.component.bind)
                })
                kfV.success = true
            } catch (e) {
                if (e !== 'ABORT PROMISE') {
                    kfV.success = false
                    kfV.message = e as string
                }
            }
            if (kfV.success) {
                kfV.message = ''
            }
        }

        return kfV.success
    }

    // 校验前过滤
    function processValidateFilter(configList: OmitEdMetaKeyConfigWithField[], changeKeys: {
        [key: string]: boolean
    } | null = null) {
        let list: OmitEdMetaKeyConfigWithField[] = configList.filter(item => (item.required.value || item.validator))
        // 仅对required.value=true/validator进行校验
        // 存在validator.scope为propagation，默认对所有
        if (list.some(item => item.validator && !hasFunction(item.validator) && item.validator.scope === TriggerScope.propagation)) {
            list = configList
        } else if (changeKeys) {
            const keys = Object.keys(changeKeys)
            list = list.filter(item => keys.includes(item.field))
        }
        return list
    }

    // 执行change校验
    async function processValidate(configList: OmitEdMetaKeyConfigWithField[], changeKeys: {
        [key: string]: boolean
    } | null = null): Promise<boolean> {
        const list: OmitEdMetaKeyConfigWithField[] = processValidateFilter(configList, changeKeys)

        const result = await Promise.all(list.map(config => {
                const {validator, field} = config
                return new Promise(async (resolve) => {
                    if (keyForTimer[field]) {
                        clearTimeout(keyForTimer[field])
                    }
                    if (((validator as InputValidator)?.triggerDelay || 0) <= 0) {
                        const success = await validateItem(config)
                        resolve(success)
                    } else {
                        keyForTimer[field] = setTimeout(async () => {
                            const success = await validateItem(config)
                            resolve(success)
                        }, (validator as InputValidator)?.triggerDelay)
                    }
                })
            })
        )

        return !result.includes(false)
    }

    return {
        keyForValidate,
        fillValidate,
        processValidate,
        previousKeyForValues,
        triggerValidatePermission
    }
}
