<template>
  <div class="g3-config-form-wrapper">
    <div class="g3-config-form-items">
      <div v-for="(item,index) in keyConfigList" :key="index" class="g3-config-form-props-wrapper">

        <template v-if="item.display">
          <slot v-if="$slots['TITLE-'+item.field]" :name="'TITLE-'+ item.field" :scope="deepClone(item)"></slot>
          <div v-else class="g3-config-form-props"
               :class="{'g3-config-form-required': item.required.value}">
            <span>{{ item.title }}</span>
          </div>
        </template>

        <div v-if="item.display">
          <component :is="renderComponentMap[item.field]"
                     :tabindex="(index+1)*1000"
                     v-model="keyForValues[item.field]"
                     v-bind="item.component.bind">
            <template v-if="item.component.children?.length" #default>
              <G3ChildrenComponent v-for="(obj,i) in item.component.children"
                                   :key="i"
                                   :body="obj.body"
                                   :bind="obj.bind"
                                   :children="obj.children">
              </G3ChildrenComponent>
            </template>
            <slot v-if="!item.component.children" :name="item.field" :scope="deepClone(item)"></slot>
          </component>
          <div class="g3-config-form-error" :class="{'is-expand': !keyForValidate[item.field].success}">
            <div class="error-content">
              {{ keyForValidate[item.field].message }}
            </div>
          </div>
        </div>

      </div>
    </div>
    <slot v-if="!readonly && $slots._FOOTER" name="_FOOTER"></slot>
    <div v-else-if="!readonly && !$slots._FOOTER" class="g3-config-form-footer">
      <button @click="submit">submit</button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  type Component, computed,
  defineAsyncComponent,
  defineComponent,
  nextTick,
  ref,
  shallowRef,
  watch
} from "vue"
import type {
  keyForString,
  MetaConfig, MetaConfigComponent,
  MetaKeyConfig,
  OmitEdMetaKeyConfigWithField,
  OmitEdMetaKeyConfig,
  PromiseComponent,
  MetaConfigKeyValues
} from "./typings/meta-config.ts"
import {baseIsEmpty, checkObjectIdentical, hasFunction, hasObject} from "./util/type-check.ts"
import type {ShallowRef} from "@vue/reactivity"
import useComponentValidator from "./util/validator.ts"
import useDataEffect from "./util/data-effect.ts"
import {G3Context} from "guava3shome-h5-utils"
import {deepClone} from "guava3shome-h5-utils/dist/object-util"
import {depConditionMap, type MetaConfigDependency} from "./typings/runtime-dependency.ts";
import {
  ABILITY_DATA_EFFECT, ABILITY_RESET_CONFIG,
  ABILITY_VALIDATE, OPPORTUNITY_BEFORE,
  OPPORTUNITY_ORDER, OPPORTUNITY_PROCESS,
  type ProcessDescriptor
} from "./typings/ability-control.ts";
import {errorDisplayRequired, ProcessAbortError} from "./typings/runtime-error.ts";
import G3ChildrenComponent from "./component/G3ChildrenComponent.vue";

export default defineComponent({
  components: {G3ChildrenComponent},
  props: {
    keyConfig: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    // 提供的初始数据，若存在初始数据，则使用初始数据值，否则使用默认数据值
    keyData: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * 主从数据影响：只针对数据不涉及配置；若同时存在依赖，则依赖优先
     * {[masterField: string]: Array<{
     *    slaveField:string
     *    valueMap: {
     *      mFValue1: sFValue1,
     *      mFValue3: sFValue3,
     *      ...
     *    }
     * }>}
     */
    keyDataEffect: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    beforeSubmit: {
      type: [Boolean, Function],
      required: false,
      default: false
    },
    immediate: {
      type: Boolean,
      required: false,
      default: true
    },
    debug: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['submit'],
  setup(props, {emit, expose, slots}) {

    const ctx = new G3Context(props)

    // 配置显示信息集合
    const keyConfigList = ref<OmitEdMetaKeyConfigWithField[]>([])
    const renderComponentMap = ref<Record<keyForString<MetaConfig>, ShallowRef | Component>>({})
    const renderComponentRefs = shallowRef<Record<keyForString<MetaConfig>, MetaConfigComponent>>({})
    // 表单问题答案对象
    const keyForValues = ref<MetaConfigKeyValues>({})
    // 备份配置字段依赖对象
    const backupKeyDependencies: Record<keyForString<MetaConfig>, MetaConfigDependency[]> = {}
    // 备份原始配置字段依赖对象
    const backupKeyConfig: Record<keyForString<MetaConfig>, OmitEdMetaKeyConfigWithField> = {}
    // 功能执行集合
    const abilityProcess: ProcessDescriptor[] = []
    ctx.addContextProps({
      keyConfigList,
      renderComponentMap,
      keyForValues,
      backupKeyDependencies,
      backupKeyConfig,
    })

    const {
      keyForValidate,
      fillValidate,
      processValidate,
      triggerValidatePermission,
      previousKeyForValues
    } = ctx.add(useComponentValidator)
    const {disableEffect, triggerDataEffect} = ctx.add(useDataEffect)

    function fillValue(field: keyForString<MetaConfig>, config: OmitEdMetaKeyConfig): void {
      // use sort：keyData > defaultValue

      const propsKeyData = props.keyData[field]
      const defaultValue = config.defaultValue
      // 0 false
      const isArrayObject = (value: any) => Array.isArray(value) || hasObject(value)
      const passList = [0, false]
      if (propsKeyData || passList.includes(propsKeyData)) {
        keyForValues.value[field] = isArrayObject(propsKeyData) ? propsKeyData : config.valueType(propsKeyData)
      } else if (defaultValue || passList.includes(defaultValue)) {
        keyForValues.value[field] = isArrayObject(defaultValue) ? defaultValue : config.valueType(defaultValue)
      } else if (Number() === config.valueType() || Boolean() === config.valueType()) {
        keyForValues.value[field] = null
      } else {
        keyForValues.value[field] = config.valueType()
      }
    }

    function fillOptions(field: keyForString<MetaConfig>, config: OmitEdMetaKeyConfig): void {
      if (hasFunction(config.options)) {
        config.options(field).then(res => config.options = res)
      }
    }

    function fillComponent(field: keyForString<MetaConfig>, config: OmitEdMetaKeyConfig, notRender: () => boolean = () => false): void {
      config.component.bind ??= {}
      if (notRender()) {
        return
      }
      renderComponentRefs.value[field] = config.component
      renderComponentMap.value[field] = hasFunction(config.component.body) ? shallowRef(defineAsyncComponent(config.component.body as PromiseComponent)) : config.component.body
    }

    function fillDependencies(field: keyForString<MetaConfig>, config: MetaKeyConfig): OmitEdMetaKeyConfigWithField {
      const {dependencies, fixed, ...otherField} = config
      // dependency init
      if (dependencies?.length) {
        dependencies.sort((a: MetaConfigDependency, b: MetaConfigDependency) => b.priority - a.priority)
        backupKeyDependencies[field] = deepClone(dependencies)
        backupKeyConfig[field] = {field, ...deepClone(otherField)}
      }
      return Object.assign(otherField, {field})
    }

    // init
    watch(() => props.keyConfig, (newValue) => {
      if (newValue) {
        const scopeElement: MetaConfig = newValue

        keyConfigList.value = Object.entries(scopeElement)
            .map(([field, config]): OmitEdMetaKeyConfigWithField | false => {
              const configCopy = deepClone(config)
              fillValue(field, configCopy)
              if (config.fixed) {
                return false
              }
              fillValidate(field, configCopy)
              fillOptions(field, configCopy)
              fillComponent(field, configCopy)
              return fillDependencies(field, configCopy)
            })
            .filter((item) => item)
            .sort((v1, v2) => (v1 as OmitEdMetaKeyConfigWithField).order - (v2 as OmitEdMetaKeyConfigWithField).order)
            // dependency search, 替换对应元数据
            .map(item => triggerReset(item as OmitEdMetaKeyConfigWithField).data)

        Object.assign(previousKeyForValues, deepClone(keyForValues.value))
        if (props.debug) {
          console.debug('[guava3shome config form] init previousKeyForValues=', JSON.parse(JSON.stringify(previousKeyForValues)))
          console.debug('[guava3shome config form] init keyConfigList=', JSON.parse(JSON.stringify(keyConfigList.value)))
          console.debug('[guava3shome config form] init keyConfigValues=', JSON.parse(JSON.stringify(keyForValues.value)))
        }
        // After initialization, verify the items that need to be verified immediately
        const filter = keyConfigList.value.filter(obj => {
          return (keyForValues.value[obj.field] && !baseIsEmpty(keyForValues.value[obj.field]) && (obj.required.value || obj.validator)) ||
              (obj.required.immediate && !hasFunction(obj.validator) && obj.validator?.immediate)
        })
        processValidate(filter)

        // -----------------------------------------------------------------------------------
        abilityProcess.push({
          opportunity: OPPORTUNITY_BEFORE,
          name: ABILITY_VALIDATE,
          order: 1,
          process: (newValue: MetaConfigKeyValues) => {
            const {result: changeRes, attach} = triggerValidatePermission.forValueChange(newValue)
            Object.assign(previousKeyForValues, deepClone(newValue))
            return {
              changeKeys: attach,
              validatePermission: changeRes
            }
          }
        })

        abilityProcess.push({
          opportunity: OPPORTUNITY_PROCESS,
          name: ABILITY_RESET_CONFIG,
          order: 1,
          process: () => {
            let hasChange = false
            const reduceList = keyConfigList.value.map(item => {
              let changeInfo = triggerReset(item)
              hasChange ||= changeInfo.change
              return changeInfo.data
            })

            if (hasChange) {
              keyConfigList.value = reduceList
            }
          }
        })

        abilityProcess.push({
          opportunity: OPPORTUNITY_PROCESS,
          name: ABILITY_VALIDATE,
          order: 2,
          process: (newValue: MetaConfigKeyValues, previousRes: any) => {
            if (previousRes?.validatePermission) {
              processValidate(keyConfigList.value, previousRes.changeKeys)
            }
          }
        })

        abilityProcess.push({
          opportunity: OPPORTUNITY_PROCESS,
          name: ABILITY_DATA_EFFECT,
          order: 3,
          process: () => {
            nextTick(() => {
              if (disableEffect.value.includes(true)) {
                disableEffect.value.length = 0
                throw new ProcessAbortError("")
              }
              triggerDataEffect(keyConfigList.value.map(item => item.field))
            })
          }
        })

        // 定义排序权重映射
        abilityProcess.sort((a, b) => {
          const stageDiff = OPPORTUNITY_ORDER[a.opportunity] - OPPORTUNITY_ORDER[b.opportunity]
          if (stageDiff !== 0) return stageDiff
          return a.order - b.order
        })
      }
    }, {immediate: true, deep: true, once: true})

    watch([() => props.keyData, () => props.keyDataEffect], () => {
      if (props.debug) {
        console.debug('[guava3shome config form] update key data: keyConfigList=', deepClone(keyConfigList.value))
      }
      keyConfigList.value.forEach((item) => fillValue(item.field, item))
      if (props.debug) {
        console.debug('[guava3shome config form] update key data after: keyConfigValues=', deepClone(keyForValues.value))
      }
    }, {deep: true, once: true})


    // core 监听表单输入值
    watch(keyForValues, (newValue) => {
      const processResult: { [key: string]: any } = {}
      for (const item of abilityProcess) {
        try {
          processResult[item.name] = item.process(newValue, processResult[item.name])
        } catch (e) {
          if (e instanceof ProcessAbortError) {
            console.log('process abort...')
            return
          } else {
            throw e
          }
        }
      }

    }, {deep: true})

    // trigger reconfiguration
    function triggerReset(oldKeyConfig: OmitEdMetaKeyConfigWithField) {

      const result = {
        change: false,
        data: oldKeyConfig
      }
      const fieldDependencyList = backupKeyDependencies[oldKeyConfig.field]
      if (fieldDependencyList?.length) {
        for (const dep of fieldDependencyList) {
          const findValue = keyForValues.value[dep.depField]

          let forCondition = false
          if (hasFunction(dep.depCondition)) {
            forCondition = dep.depCondition(findValue, dep.depValues)
          } else {
            forCondition = depConditionMap[dep.depCondition](findValue, dep.depValues)
          }

          if (forCondition) {
            result.change = true
            if (checkObjectIdentical(result.data, Object.assign(deepClone(backupKeyConfig[oldKeyConfig.field]), dep.reset))) {
              continue
            }
            Object.assign(result.data, dep.reset)
            if (props.debug) {
              console.debug('\n[guava3shome config form] After dependencies config=', deepClone(result.data))
            }
            // 清空不显示key的value
            if (result.data.display) {
              fillValue(oldKeyConfig.field, result.data)
              fillValidate(oldKeyConfig.field, result.data)
              fillOptions(oldKeyConfig.field, result.data)
            } else {
              errorDisplayRequired(oldKeyConfig.field, result.data)
              keyForValues.value[oldKeyConfig.field] = ''
            }
            break
          } else {
            result.change = !checkObjectIdentical(result.data, backupKeyConfig[oldKeyConfig.field]);
            result.change && Object.assign(result.data, backupKeyConfig[oldKeyConfig.field])
          }
        }

        fillComponent(oldKeyConfig.field, result.data, () => checkObjectIdentical(renderComponentRefs.value[oldKeyConfig.field], result.data.component))
      }

      return result

    }

    async function submit(): Promise<Record<keyForString<MetaConfig>, any> | undefined> {
      try {
        await new Promise<void>((resolve, reject) => {
          if (hasFunction(props.beforeSubmit)) {
            props.beforeSubmit(resolve, reject)
          } else {
            resolve()
          }
        })
        const success = await processValidate(keyConfigList.value)
        if (!success) {
          return
        }
        // 提交数据
        const cloneData = deepClone(keyForValues.value)
        if (slots._FOOTER) {
          return cloneData
        } else {
          emit('submit', cloneData)
        }
      } catch (e) {
        console.log('>> G3ConfigForm Error: ', e)
      }
    }

    function reset(): void {
      keyConfigList.value.forEach(config => keyForValues.value[config.field] = '')
    }

    expose({reset, submit})

    return {
      keyConfigList,
      keyForValues,
      submit,
      renderComponentMap,
      keyForValidate,
      deepClone
    }
  }
})

</script>


<style>


.g3-config-form-props-wrapper {
  margin-bottom: 20px;
}

.g3-config-form-footer {
  display: flex;
}

.g3-config-form-footer > button {
  border-radius: 15px;
  height: 50px;
  width: 100%;
  border: 1px solid #000000;
}

.g3-config-form-props {
  margin-bottom: 5px;
}

.g3-config-form-required::after {
  content: '*';
  margin: 0 5px;
  color: red;
}

.g3-config-form-error {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 100ms ease-in;
  color: red;
  font-size: 12px;
  margin: 5px 0;
  overflow: hidden;
}

.g3-config-form-error.is-expand {
  grid-template-rows: 1fr;
}

.error-content {
  min-height: 0;
}

</style>
