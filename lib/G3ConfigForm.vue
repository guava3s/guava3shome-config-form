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

          <div>
            <component :is="renderComponentMap[item.field]"
                       :tabindex="(index+1)*1000"
                       v-model="keyForValues[item.field]"
                       :copy-config-form-values="JSON.parse(JSON.stringify(keyForValues))"
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
        </template>

      </div>
    </div>
    <slot v-if="!readonly && $slots._FOOTER" name="_FOOTER"
          :fieldData="JSON.parse(JSON.stringify(keyForValues))"></slot>
    <div v-else-if="!readonly && !$slots._FOOTER" class="g3-config-form-footer">
      <button @click="submit">submit</button>
    </div>
  </div>
</template>

<script lang="ts">
import {type Component, defineAsyncComponent, defineComponent, ref, shallowRef, watch} from "vue"
import type {
  keyForString,
  MetaConfig,
  MetaConfigComponent,
  MetaConfigKeyValues,
  MetaKeyConfig,
  OmitEdMetaKeyConfig,
  PromiseComponent,
  RunTimeMetaKeyConfig
} from "./typings/meta-config.ts"
import {baseIsEmpty, checkObjectIdentical, hasFunction, hasObject} from "./util/type-check.ts"
import type {ShallowRef} from "@vue/reactivity"
import useComponentValidator from "./util/validator.ts"
import useDataEffect from "./util/data-effect.ts"
import {G3Context} from "guava3shome-h5-utils"
import {deepClone} from "guava3shome-h5-utils/dist/object-util"
import {
  depConditionMap,
  type MetaConfigDependency,
  type RuntimeMetaConfigDependency
} from "./typings/runtime-dependency.ts";
import {
  ABILITY_RESET_CONFIG,
  OPPORTUNITY_ORDER,
  OPPORTUNITY_PROCESS,
  type ProcessDescriptor
} from "./typings/ability-control.ts";
import {
  errorDisplayRequired,
  configConvert,
  ProcessAbortError, SimilarRationalityError
} from "./util/rational.ts";
import G3ChildrenComponent from "./component/G3ChildrenComponent.vue";
import type {DataEffect} from "./typings/runtime-data-effect.ts";

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
     *    slaveValueMap: {
     *      mFValue1: sFValue1,
     *      mFValue3: sFValue3,
     *      ...
     *    }
     * }>}
     */
    keyDataEffect: {
      type: Object as () => DataEffect,
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
    const keyConfigList = ref<RunTimeMetaKeyConfig[]>([])
    const renderComponentMap = ref<Record<keyForString<MetaConfig>, ShallowRef | Component>>({})
    const renderComponentRefs = shallowRef<Record<keyForString<MetaConfig>, MetaConfigComponent>>({})
    // 表单问题答案对象
    const keyForValues = ref<MetaConfigKeyValues>({})
    // 备份配置字段依赖对象
    const backupKeyDependencies: Record<keyForString<MetaConfig>, RuntimeMetaConfigDependency[]> = {}
    // 备份原始配置字段对象
    const backupKeyConfig: Record<keyForString<MetaConfig>, RunTimeMetaKeyConfig> = {}
    // 功能执行集合
    const abilityProcess: ProcessDescriptor[] = []
    ctx.addContextProps({
      abilityProcess,
      keyConfigList,
      renderComponentMap,
      keyForValues,
      backupKeyDependencies,
      backupKeyConfig,
    })

    const handleConfigConvert = configConvert(props)

    // 使用数据校验功能
    const {
      keyForValidate,
      fillValidate,
      processValidate,
      previousKeyForValues
    } = ctx.add(useComponentValidator)
    // 使用数据影响功能
    ctx.add(useDataEffect)


    function generateConfig(scopeList: [string, MetaKeyConfig][]): RunTimeMetaKeyConfig[] {
      return scopeList.map(([field, config]): RunTimeMetaKeyConfig | false => {
        const {runtimeConfig, fixed} = handleConfigConvert(field, config)
        fillKeyValue(field, runtimeConfig)
        if (fixed) {
          return false
        }
        backupKeyConfig[field] = runtimeConfig
        fillValidate(field, runtimeConfig)
        fillComponent(field, runtimeConfig)
        initDependencies(field, config)
        return runtimeConfig
      })
          .filter((item) => item)
          .sort((v1, v2) => (v1 as RunTimeMetaKeyConfig).order - (v2 as RunTimeMetaKeyConfig).order)
          // dependency search, 替换对应元数据
          .map(item => triggerReset(item as RunTimeMetaKeyConfig).data)
    }

    function fillSimilarItem(scopeElement: MetaConfig): MetaConfig {
      const result = deepClone(scopeElement)
      for (const [field, config] of Object.entries(result)) {
        if (!config.similarItem) {
          continue
        }

        if (config.fixed) {
          throw new SimilarRationalityError("SimilarItem configuration item does not allow 'fixed'.")
        }
        if (config.similarItem === field) {
          throw new SimilarRationalityError("The SimilarItem configuration of this configuration item cannot be the same as the current field.")
        }
        result[field] = Object.assign(deepClone(result[config.similarItem]), config)
      }

      return result
    }

    function fillKeyValue(field: keyForString<MetaConfig>, config: RunTimeMetaKeyConfig): void {
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

    function fillComponent(field: keyForString<MetaConfig>, config: OmitEdMetaKeyConfig, notRender: () => boolean = () => false): void {
      config.component.bind ??= {}
      if (notRender()) {
        return
      }
      renderComponentRefs.value[field] = config.component
      renderComponentMap.value[field] = hasFunction(config.component.body) ? shallowRef(defineAsyncComponent(config.component.body as PromiseComponent)) : config.component.body
    }

    function initDependencies(field: keyForString<MetaConfig>, {dependencies}: MetaKeyConfig): void {
      // dependency init
      if (dependencies?.length) {
        dependencies.sort((a: MetaConfigDependency, b: MetaConfigDependency) => b.priority - a.priority)
        backupKeyDependencies[field] = deepClone(dependencies.map(item => {
          const {reset, ...other} = item
          return {
            ...other,
            reset: handleConfigConvert(field, reset).runtimeConfig
          }
        }))
      }
    }

    // init
    watch(() => props.keyConfig, (newValue: MetaConfig) => {
      if (newValue) {

        const genScopeList = fillSimilarItem(newValue)
        keyConfigList.value = generateConfig(Object.entries(genScopeList))

        Object.assign(previousKeyForValues, deepClone(keyForValues.value))
        if (props.debug) {
          console.debug('[config form] Init previousKeyForValues=', JSON.parse(JSON.stringify(previousKeyForValues)))
          console.debug('[config form] Init keyConfigList=', JSON.parse(JSON.stringify(keyConfigList.value)))
          console.debug('[config form] Init keyConfigValues=', JSON.parse(JSON.stringify(keyForValues.value)))
        }
        // After initialization, verify the items that need to be verified immediately
        const filter = keyConfigList.value.filter((obj: RunTimeMetaKeyConfig) => {
          return (keyForValues.value[obj.field] && !baseIsEmpty(keyForValues.value[obj.field]) && (obj.required.value || obj.validator)) ||
              (obj.required.immediate && !hasFunction(obj.validator) && obj.validator?.immediate)
        })
        processValidate(filter)

        // -----------------------------------------------------------------------------------
        abilityProcess.push({
          opportunity: OPPORTUNITY_PROCESS,
          name: ABILITY_RESET_CONFIG,
          order: 20,
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

        // 定义排序权重映射
        abilityProcess.sort((a, b) => {
          const stageDiff = OPPORTUNITY_ORDER[a.opportunity] - OPPORTUNITY_ORDER[b.opportunity]
          if (stageDiff !== 0) return stageDiff
          return a.order - b.order
        })
      }
    }, {immediate: true, deep: true, once: true})


    watch(() => props.keyData, () => {
      keyConfigList.value.forEach((item) => fillKeyValue(item.field, item))
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
    function triggerReset(oldKeyConfig: RunTimeMetaKeyConfig): { change: boolean, data: RunTimeMetaKeyConfig } {

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
              console.debug('\n[config form] After dependencies config=', deepClone(result.data))
            }
            fillKeyValue(oldKeyConfig.field, result.data)
            if (result.data.display) {
              fillValidate(oldKeyConfig.field, result.data)
            } else {
              // 配置项不显示时使用defaultValue值
              errorDisplayRequired(oldKeyConfig.field, result.data)
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
        keyConfigList.value.forEach(item => {
          if (item.submitConvert) {
            cloneData[item.field] = item.submitConvert(cloneData[item.field])
          }
        })
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
