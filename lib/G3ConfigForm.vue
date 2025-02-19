<template>
  <div class="g3-config-form-wrapper">
    <div class="g3-config-form-items">
      <div v-for="(item,index) in keyConfigList" :key="index" class="g3-config-form-props-wrapper">

        <template v-if="item.display">
          <slot v-if="$slots['TITLE-'+item.field]" :name="'TITLE-'+item.field" :scope="deepClone(item)"></slot>
          <div v-else class="g3-config-form-props"
               :class="{'g3-config-form-required': item.required.value}">
            <span>{{ item.title }}</span>
          </div>
        </template>

        <div v-if="item.display">
          <component :is="renderComponentMap[item.field]"
                     :tabindex="index"
                     v-model="keyForValues[item.field]"
                     v-bind="item.componentProps">
            <slot :name="item.field" :scope="deepClone(item)"></slot>
          </component>
          <div class="g3-config-form-error" :class="{'is-expand': !keyForValidate[item.field].success}">
            <div class="error-content">
              {{ keyForValidate[item.field].message }}
            </div>
          </div>
        </div>

      </div>
    </div>
    <slot v-if="!readonly && $slots.FOOTER" name="FOOTER"></slot>
    <div v-else-if="!readonly && !$slots.FOOTER" class="g3-config-form-footer">
      <button @click="submit">submit</button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineAsyncComponent,
  defineComponent,
  nextTick,
  ref,
  shallowRef,
  watch
} from "vue"
import type {
  keyForString,
  MetaConfig,
  MetaConfigDependency,
  MetaKeyConfig,
  MetaKeyConfigWithField,
} from "./typings/meta-config.ts"
import {containKey, hasFunction} from "./util/type-check.ts"
import type {ShallowRef} from "@vue/reactivity"
import useComponentValidator from "./util/validator.ts"
import useDataEffect from "./util/data-effect.ts"
import {G3Context} from "guava3shome-h5-utils"
import {deepClone} from "guava3shome-h5-utils/dist/object-util"

export default defineComponent({
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
    }
  },
  emits: ['submit'],
  setup(props, {emit, expose, slots}) {

    const ctx = new G3Context(props)

    // 配置显示信息集合
    const keyConfigList = ref<MetaKeyConfigWithField[]>([])
    const renderComponentMap = ref<Record<keyForString<MetaConfig>, ShallowRef>>({})
    // 表单问题答案对象
    const keyForValues = ref<Record<keyForString<MetaConfig>, any>>({})
    // 配置字段依赖对象
    const backupKeyDependencies = ref<Record<keyForString<MetaConfig>, MetaConfigDependency[]>>({})
    // 原始配置字段依赖对象
    const backupKeyConfig = ref<Record<keyForString<MetaConfig>, MetaKeyConfigWithField>>({})

    ctx.addContextProps({
      keyConfigList,
      renderComponentMap,
      keyForValues,
      backupKeyDependencies,
      backupKeyConfig,
    })

    const {keyForValidate, fillValidate, processValidate} = ctx.add(useComponentValidator)
    const {disableEffect, triggerDataEffect} = ctx.add(useDataEffect)

    function fillValue(field: keyForString<MetaConfig>, config: MetaKeyConfig): void {
      // use sort：keyData > defaultValue
      let renderValue = props.keyData[field]

      if (!renderValue && config.defaultValue) {
        if (config.valueType) {
          const isArrayType = config.valueType === Array
          const isObjectType = config.valueType === Object

          renderValue = (isArrayType && Array.isArray(config.defaultValue)) || (isObjectType) ?
              config.defaultValue :
              config.valueType(config.defaultValue)
        } else {
          // 无 valueType 时直接使用默认值
          renderValue = config.defaultValue;
        }
      }

      keyForValues.value[field] = renderValue ?? null
    }

    function fillOptions(field: keyForString<MetaConfig>, config: MetaKeyConfig): void {
      if (hasFunction(config.options)) {
        config.options(field).then(res => config.options = res)
      }
    }

    // init
    watch(props, (newValue) => {
      if (newValue.keyConfig) {
        const scopeElement: MetaConfig = newValue.keyConfig

        keyConfigList.value = Object.entries(scopeElement)
            .map(([field, config]) => {
              const element = {
                field,
                ...deepClone(config)
              }
              fillValue(field, element)
              element.fixed ??= false
              if (element.fixed) {
                return element
              }
              fillValidate(field, element)
              fillOptions(field, element)

              const {dependencies, ...otherField} = element
              renderComponentMap.value[field] = shallowRef(defineAsyncComponent(element.component))
              element.componentProps ??= {}

              // dependency init
              if (dependencies?.length) {
                dependencies.sort((a: MetaConfigDependency, b: MetaConfigDependency) => b.priority - a.priority)
                backupKeyDependencies.value[field] = deepClone(dependencies)
                backupKeyConfig.value[field] = {...otherField}
              }

              return element
            })
            .filter(item => !item.fixed)
            .sort((v1, v2) => v1.order - v2.order)
            // dependency search, 替换对应元数据
            .map(item => triggerReset(item).data)

        // After initialization, verify the items that need to be verified immediately
        processValidate(keyConfigList.value.filter(obj => obj.required.immediate && !hasFunction(obj.validator) && obj.validator?.immediate))
      }
    }, {immediate: true, deep: true})


    let previousKeyForValues = JSON.parse(JSON.stringify(keyForValues.value))
    // core 监听表单输入值
    watch(keyForValues, (newValue) => {

      const changeKeys: { [key: string]: boolean } = {}
      for (const key in newValue) {
        if (newValue[key] !== previousKeyForValues[key]) {
          changeKeys[key] = true
        }
      }
      previousKeyForValues = JSON.parse(JSON.stringify(newValue))

      let hasChange = false

      const reduceList = keyConfigList.value.map(item => {
        let changeInfo = triggerReset(item)
        hasChange ||= changeInfo.change
        return changeInfo.data
      })

      if (hasChange) {
        keyConfigList.value = reduceList
      }

      nextTick(() => {
        if (disableEffect.value.includes(true)) {
          disableEffect.value.length = 0
          return
        }
        triggerDataEffect(keyConfigList.value.map(item => item.field))
      })

      processValidate(keyConfigList.value, changeKeys)

    }, {deep: true})

    // trigger reconfiguration
    function triggerReset(oldKeyConfig: MetaKeyConfigWithField) {

      const result = {
        change: false,
        data: oldKeyConfig
      }
      const fieldDependencyList = backupKeyDependencies.value[oldKeyConfig.field]
      if (fieldDependencyList?.length) {
        let resetScopeInfo = null
        for (const dep of fieldDependencyList) {
          const findValue = keyForValues.value[dep.depField]

          if (dep.depCondition === 'some' && dep.depValues.includes(findValue) ||
              dep.depCondition === 'not_in' && !dep.depValues.includes(findValue) ||
              dep.depCondition === 'all' && findValue.every((dV: any) => dep.depValues.includes(dV))) {
            resetScopeInfo = Object.assign(oldKeyConfig, dep.reset)
            // 清空不显示key的value
            if (!resetScopeInfo.display) {
              keyForValues.value[oldKeyConfig.field] = ''
            }
            break
          } else {
            resetScopeInfo = Object.assign(oldKeyConfig, backupKeyConfig.value[oldKeyConfig.field])
          }
        }

        // 针对单一个字段通过
        if (resetScopeInfo) {
          result.change = true
          // result.data = resetScopeInfo
        } else if (containKey(backupKeyConfig.value, oldKeyConfig.field)) {
          // 恢复
          result.change = true
          result.data = backupKeyConfig.value[oldKeyConfig.field]
        }
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
        const cloneData = deepClone(keyForValues.value);
        if (slots.FOOTER) {
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
