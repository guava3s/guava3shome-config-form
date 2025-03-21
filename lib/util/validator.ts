import {ref} from "vue";
import type {
    keyForString,
    MetaConfig,
    MetaConfigKeyValues,
    RunTimeMetaKeyConfig
} from "../typings/meta-config.ts";
import type {
    InputValidator, ProcessValidatePermission,
    RequiredDescValidator,
    ValidateResultParams
} from "../typings/runtime-validate.ts";
import {TriggerScope} from "../typings/runtime-validate.ts";
import type {InternalContext} from "guava3shome-h5-utils";
import {deepClone} from "guava3shome-h5-utils/dist/object-util";
import {baseIsEmpty, hasFunction} from "./type-check.ts";
import {errorDisplayRequired} from "./rational.ts";
import {
    ABILITY_VALIDATE,
    OPPORTUNITY_AFTER,
    OPPORTUNITY_PROCESS
} from "../typings/ability-control.ts";
import type {
    ProcessDescriptor
} from '../typings/ability-control.ts'

/*
校验原则：
    初始化时：
    初始化有值，必校验，无论immediate是为true；
    初始化无值，根据required为true或者validator是否存在，由immediate决定是否校验；

    校验时：
    前提仅对required为true或validator存在的配置项进行校验，可以控制范围；若是validator.scope为propagation，则全部校验；反之仅校验值变化的配置项
 */

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
                    console.debug('\n[config form] for value change: key=', key)
                    console.debug('[config form] for value change: new value=', deepClone(newKeyValues[key]))
                    console.debug('[config form] for value change: previous value=', deepClone(previousKeyForValues[key]))
                    console.debug('[config form] for Value change: new and previous equals=', equals)
                    console.debug('[config form] for value change: new value baseIsEmpty=', baseIsEmpty(newKeyValues[key]))
                    console.debug('[config form] for value change: previous value baseIsEmpty=', baseIsEmpty(newKeyValues[key]))
                }
                if (equals && !(baseIsEmpty(newKeyValues[key]) && baseIsEmpty(previousKeyForValues[key]))) {
                    changeKeys[key] = true
                }
            }
            if (props.debug) {
                console.debug('[config form] for value change:final changeKeys=', deepClone(changeKeys))
            }
            return {
                result: Object.values(changeKeys).includes(true),
                attach: changeKeys
            }
        }
    }

    // 默认校验: return success?
    function defaultValidate(field: keyForString<MetaConfig>, required: Required<RequiredDescValidator>): boolean {
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
    function fillValidate(field: keyForString<MetaConfig>, config: RunTimeMetaKeyConfig): void {
        errorDisplayRequired(field, config)
        keyForValidate.value[field] = {
            success: config.required.immediate ? defaultValidate(field, config.required) : true,
            message: config.required.message,
        }
    }

    async function validateItem(config: RunTimeMetaKeyConfig): Promise<boolean> {
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
    function processValidateFilter(configList: RunTimeMetaKeyConfig[], changeKeys: {
        [key: string]: boolean
    } | null = null) {
        let list: RunTimeMetaKeyConfig[] = configList.filter(item => (item.required.value || item.validator))
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
    async function processValidate(configList: RunTimeMetaKeyConfig[], changeKeys: {
        [key: string]: boolean
    } | null = null): Promise<boolean> {
        if (props.debug) {
            console.debug('[config form] processValidate: receive config List=', deepClone(configList))
            console.debug('[config form] Key For Values=', deepClone(context.keyForValues.value))
        }

        const list: RunTimeMetaKeyConfig[] = processValidateFilter(configList, changeKeys)

        if (props.debug) {
            console.debug('[config form] processValidate: start config List=', JSON.parse(JSON.stringify(list)))
        }

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

        if (props.debug) {
            console.debug('[config form] processValidate result=', result)
        }

        return !result.includes(false)
    }


    context.abilityProcess.push({
        opportunity: OPPORTUNITY_PROCESS,
        name: ABILITY_VALIDATE,
        order: 999,
        process: (newValue: MetaConfigKeyValues) => {
            const {result: changeRes, attach} = triggerValidatePermission.forValueChange(newValue)
            Object.assign(previousKeyForValues, deepClone(newValue))
            return {
                changeKeys: attach,
                validatePermission: changeRes
            }
        }
    })
    context.abilityProcess.push({
        opportunity: OPPORTUNITY_AFTER,
        name: ABILITY_VALIDATE,
        order: 30,
        process: (newValue: MetaConfigKeyValues, previousRes: any) => {
            if (previousRes?.validatePermission) {
                processValidate(context.keyConfigList.value, previousRes.changeKeys)
            }
        }
    })

    return {
        keyForValidate,
        fillValidate,
        processValidate,
        previousKeyForValues
    }
}
