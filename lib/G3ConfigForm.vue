<template>
  <div class="g3-config-form-wrapper">
    <div class="g3-config-form-items">
      <div v-for="(item,index) in keyConfigList" :key="index" class="g3-config-form-props-wrapper">

        <div v-if="item.display" class="g3-config-form-props" :class="{'g3-config-form-required': item.required.value}">
          <span>{{ item.title }}</span>
        </div>

        <template v-if="item.display">
          <component :is="renderComponentMap[item.field]" v-model="keyForValues[item.field]"
                     v-bind="item.componentProps">
            <slot :name="item.field" :scope="item.componentProps"></slot>
          </component>
          <div class="g3-config-form-error" :style="{maxHeight: `${keyForValidate[item.field].success?0:38}px`}">
            {{ keyForValidate[item.field].message }}
          </div>
        </template>

      </div>
    </div>
    <div v-if="!readonly && !useFooterSlot" class="g3-config-form-footer">
      <button @click="submit">submit</button>
      <button @click="resetScopeForm">cancel</button>
    </div>
    <slot v-else-if="!readonly && useFooterSlot" name="footer"></slot>
  </div>
</template>

<script lang="ts">
import {defineAsyncComponent, defineComponent, nextTick, ref, shallowRef, watch} from "vue"
import type {
  MetaConfig,
  MetaConfigDependency,
  MetaKeyConfig,
  MetaKeyConfigWithField,
} from "./typings/meta-config.ts"
import {containKey} from "./util/type-check.ts"
import type {ShallowRef} from "@vue/reactivity"
import useComponentValidator from "./util/validator.ts"
import useDataEffect from "./util/data-effect.ts"
import {G3Context} from "guava3shome-h5-utils"
import {deepClone} from "guava3shome-h5-utils/dist/object-util"


const VALUE_TYPE_MAP = {
  'number': (value: any) => Number(value),
  'boolean': (value: any) => Boolean(value),
  'string': (value: any) => String(value ?? ''),
  'base_array': (value: any) => value ?? []
}


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
     * 自定义选项
     * {[field:string] : Array<MetaOptionConfig>}
     */
    customOptions: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
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
    useFooterSlot: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  emits: ['submit', 'cancel'],
  setup(props, {emit, expose}) {

    const ctx = new G3Context(props)

    // 配置显示信息集合
    const keyConfigList = ref<MetaKeyConfigWithField[]>([])
    const renderComponentMap = ref<Record<keyof MetaConfig, ShallowRef>>({})
    // 表单问题答案对象
    const keyForValues = ref<Record<keyof MetaConfig, any>>({})
    // 配置字段依赖对象
    const backupKeyDependencies = ref<Record<keyof MetaConfig, MetaConfigDependency[]>>({})
    // 原始配置字段依赖对象
    const backupKeyConfig = ref<Record<keyof MetaConfig, MetaKeyConfigWithField>>({})

    ctx.addContextProps({
      keyConfigList,
      renderComponentMap,
      keyForValues,
      backupKeyDependencies,
      backupKeyConfig,
    })

    const {keyForValidate, fillValidate, processValidate} = ctx.add(useComponentValidator)
    const {disableEffect, triggerDataEffect} = ctx.add(useDataEffect)

    function fillValue(field: keyof MetaConfig, config: MetaKeyConfig): void {
      // use sort：keyData > defaultValue
      let renderValue = props.keyData[field]
      if (!renderValue && config.valueType && config.defaultValue) {
        renderValue = VALUE_TYPE_MAP[config.valueType](config.defaultValue)
      }
      keyForValues.value[field] = renderValue ?? null
    }

    // 是否需要监听值变化
    watch(props, (newValue) => {
      if (newValue.keyConfig) {
        const scopeElement: MetaConfig = newValue.keyConfig

        keyConfigList.value = Object.entries(scopeElement)
            .map((element) => {
              let [field, config] = element
              config = deepClone(config)
              const {dependencies, ...otherField} = config
              renderComponentMap.value[field] = shallowRef(defineAsyncComponent(config.component))
              config.componentProps.disable ||= props.readonly

              // 依赖初始化
              if (dependencies?.length) {
                dependencies.sort((a: MetaConfigDependency, b: MetaConfigDependency) => b.priority - a.priority)
                backupKeyDependencies.value[field] = dependencies
                backupKeyConfig.value[field] = {field, ...otherField}
              }

              fillValue(field, config)
              fillValidate(field, config)

              return element
            })
            .sort(([_1, v1], [_2, v2]) => v1.order - v2.order)
            // 检索依赖，替换对应元数据
            .map(item => triggerReset(Object.assign(item[1], {field: item[0]})).data)


        processValidate(keyConfigList.value.filter(obj => obj.validator?.immediate))
      }
    }, {immediate: true, deep: true})


    // 监听表单输入值
    watch(keyForValues, async () => {
      let hasChange = false

      const reduceList = keyConfigList.value.map(item => {
        let changeInfo = triggerReset(item)
        hasChange ||= changeInfo.change
        return changeInfo.data
      })

      if (hasChange) {
        keyConfigList.value = reduceList
      }

      await nextTick()
      if (disableEffect.value.includes(true)) {
        disableEffect.value.length = 0
        return
      }
      triggerDataEffect(keyConfigList.value.map(item => item.field))

      processValidate(keyConfigList.value)

    }, {deep: true})

    // 触发重新配置
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

          if (dep.depCondition === 'SOME' && dep.depValues.includes(findValue) ||
              dep.depCondition === 'NOT_IN' && !dep.depValues.includes(findValue) ||
              dep.depCondition === 'ALL' && dep.depValues.every(dV => dV === findValue)) {
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
          result.data = resetScopeInfo
        } else if (containKey(backupKeyConfig.value, oldKeyConfig.field)) {
          // 恢复
          result.change = true
          result.data = backupKeyConfig.value[oldKeyConfig.field]
        }
      }

      return result

    }

    async function submit(): Promise<void> {
      const success = await processValidate(keyConfigList.value)
      // 提交数据
      success && !props.useFooterSlot && emit('submit', JSON.parse(JSON.stringify(keyForValues.value)))
    }

    function resetScopeForm(): void {
      Object.keys(keyForValues.value).forEach(key => keyForValues.value[key] = '')
      !props.useFooterSlot && emit('cancel')
    }

    expose({resetScopeForm, submit})

    return {
      keyConfigList,
      keyForValues,
      submit,
      resetScopeForm,
      renderComponentMap,
      keyForValidate
    }
  }
})

</script>


<style scoped>


.g3-config-form-props-wrapper {
  margin-bottom: 20px;
}

.g3-config-form-footer > button {
  margin: 10px;
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
  color: red;
  font-size: 12px;
  margin: 5px 0;
  overflow: hidden;
  transition: all 100ms ease-in;
}

</style>
