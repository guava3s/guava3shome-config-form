<template>
  <div class="g3-config-form-wrapper">
    <div class="g3-config-form-items">
      <div v-for="(item,index) in keyConfigList" :key="index" class="g3-config-form-props-wrapper">

        <div v-if="item.display" class="g3-config-form-props" :class="{'g3-config-form-required': item.required}">
          <span>{{ item.title }}</span>
        </div>

        <template v-if="item.display">
          <component :is="renderComponentMap[item.field]" v-model="scopeValues[item.field]"
                     v-bind="item.componentProps">
            <slot :name="item.field" :scope="item.componentProps"></slot>
          </component>
          <div v-if="validator(item)" class="g3-config-form-error">{{ item.verifyPrompt }}</div>
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
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  nextTick,
  ref,
  shallowRef,
  watch
} from "vue"
import type {
  MetaConfig,
  MetaConfigDependency,
  MetaKeyConfigWithField,
  SlaveFieldValueMap
} from "./typings/meta-config.ts"
import {containKey} from "./util/type-check.ts"
import type {ShallowRef} from "@vue/reactivity"


const VALUE_TYPE_MAP = {
  'NUMBER': (value: any) => Number(value),
  'BOOLEAN': (value: any) => Boolean(value),
  'STRING': (value: any) => String(value ?? ''),
  'BASE_ARRAY': (value: any) => value ?? []
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

    // 配置显示信息集合
    const keyConfigList = ref<MetaKeyConfigWithField[]>([])
    const renderComponentMap = ref<Record<keyof MetaConfig, ShallowRef>>({})
    // 表单问题答案对象
    const scopeValues = ref<Record<keyof MetaConfig, any>>({})
    // 配置字段依赖对象
    const backupKeyDependencies = ref<Record<keyof MetaConfig, MetaConfigDependency[]>>({})
    // 原始配置字段依赖对象
    const backupKeyConfig = ref<Record<keyof MetaConfig, MetaKeyConfigWithField>>({})

    // 是否需要监听值变化
    // 0.0.2
    watch(props, (newValue) => {
      if (newValue.keyConfig) {
        const scopeElement: MetaConfig = newValue.keyConfig

        initConfig(scopeElement)

        keyConfigList.value = Object.entries(scopeElement)
            .map((ele) => {
              const [key, obj] = ele
              // 优先顺序：keyData > defaultValue
              let renderValue = props.keyData[key]
              if (!renderValue && obj.valueType && obj.defaultValue) {
                renderValue = VALUE_TYPE_MAP[obj.valueType](obj.defaultValue)
              }
              scopeValues.value[key] = renderValue ?? null
              return ele
            })
            .sort(([_1, v1], [_2, v2]) => v1.order - v2.order)
            // 检索依赖，替换对应元数据
            .map(item => triggerReset(Object.assign(item[1], {field: item[0]})).data)
      }
    }, {immediate: true, deep: true})


    function initConfig(scopeElement: MetaConfig) {
      // 组件装载
      for (const field in scopeElement) {
        const element = scopeElement[field]
        const {dependencies, ...otherField} = element
        renderComponentMap.value[field] = shallowRef(defineAsyncComponent(element.component))
        element.componentProps.disable ||= props.readonly

        // 依赖初始化
        if (dependencies?.length) {
          dependencies.sort((a: MetaConfigDependency, b: MetaConfigDependency) => b.priority - a.priority)
          backupKeyDependencies.value[field] = dependencies
          backupKeyConfig.value[field] = {field, ...otherField}
        }
      }
    }

    function useDisabledEffect() {
      // 禁用数据影响判定数组
      const disableEffect = ref<boolean[]>([])

      function triggerDataEffect(fieldMap: string[]) {
        for (let masterField of fieldMap) {
          if (props.keyDataEffect[masterField]?.length > 0) {

            const slaveFields = new Set()
            props.keyDataEffect[masterField].forEach((item: SlaveFieldValueMap) => {
              slaveFields.add(item.slaveField)

              for (const [key, value] of Object.entries(item.slaveValueMap)) {
                if (scopeValues.value[masterField] === key) {
                  disableEffect.value.push(true)
                  scopeValues.value[item.slaveField] = value
                  break
                }
                disableEffect.value.push(false)
              }
            })

            triggerDataEffect(Array.from(slaveFields) as string[])
          }
        }
      }

      return {
        disableEffect,
        triggerDataEffect
      }
    }

    const {disableEffect, triggerDataEffect} = useDisabledEffect()


    // 监听表单输入值
    watch(scopeValues, () => {
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

    }, {deep: true})


    // 触发重新配置
    // 0.0.1
    function triggerReset(oldKeyConfig: MetaKeyConfigWithField) {

      const result = {
        change: false,
        data: oldKeyConfig
      }
      const fieldDependencyList = backupKeyDependencies.value[oldKeyConfig.field]
      if (fieldDependencyList?.length) {
        let resetScopeInfo = null
        for (const dep of fieldDependencyList) {
          const findValue = scopeValues.value[dep.depField]

          if (dep.depCondition === 'SOME' && dep.depValues.includes(findValue) ||
              dep.depCondition === 'NOT_IN' && !dep.depValues.includes(findValue) ||
              dep.depCondition === 'ALL' && dep.depValues.every(dV => dV === findValue)) {
            resetScopeInfo = Object.assign(oldKeyConfig, dep.reset)
            // 清空不显示key的value
            if (!resetScopeInfo.display) {
              scopeValues.value[oldKeyConfig.field] = ''
            }
            break
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

    // 校验器
    const validator = computed(() => {
      return (item: MetaKeyConfigWithField) => validate(item)
    })

    // 校验是否无效
    function validate(item: MetaKeyConfigWithField): boolean {
      const fieldValue = scopeValues.value[item.field];
      return (item.required && (['null', 'undefined', ''].includes(String(fieldValue))))
    }

    function submit(): void {
      // 提交前校验
      const parse = JSON.parse(JSON.stringify(scopeValues.value))
      if (keyConfigList.value.some(validator.value)) {
        return
      }
      // 提交数据
      !props.useFooterSlot && emit('submit', parse)
    }

    function resetScopeForm(): void {
      Object.keys(scopeValues.value).forEach(key => scopeValues.value[key] = '')
      !props.useFooterSlot && emit('cancel')
    }

    expose({resetScopeForm, submit})


    return {
      keyConfigList,
      scopeValues,
      validator,
      submit,
      resetScopeForm,
      renderComponentMap
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
}

</style>
