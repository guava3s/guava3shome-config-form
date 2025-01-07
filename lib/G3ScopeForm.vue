<template>
  <div class="g3-scope-form-wrapper">
    <div class="g3-scope-form-items">
      <div v-for="(item,index) in scopeKeyDetailList" :key="index" class="g3-scope-form-props-wrapper">

        <div v-if="item.display" class="g3-scope-form-props" :class="{'g3-scope-form-required': item.required}">
          <span>{{ item.title }}</span>
        </div>

        <template v-if="item.display">
          <component :is="renderComponentMap[item.field]" v-model="scopeValues[item.field]"
                     v-bind="item.componentProps"></component>
        </template>

        <!-- 优先使用 数据字典 value-->
        <!--          <template v-else-if="item.display && item.type === 'SELECT_BY_DICT_VALUE'">-->
        <!--            <el-select v-model="scopeValues[item.field]"-->
        <!--                       clearable-->
        <!--                       filterable-->
        <!--                       :placeholder="item.placeholder"-->
        <!--                       :disable="!!item.readonly || readonly">-->
        <!--              <el-option v-for="e in item.options"-->
        <!--                         :key="e.id"-->
        <!--                         :label="renderSelectLabel(e)"-->
        <!--                         :value="e.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'SELECT_BY_DICT_MULTI_VALUE'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                multiple-->
        <!--                collapse-tags-->
        <!--                collapse-tags-tooltip-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :max-collapse-tags="5"-->
        <!--                :disable="!!item.readonly || readonly"-->
        <!--                :placeholder="item.placeholder">-->
        <!--              <el-option v-for="e in item.options"-->
        <!--                         :key="e.id"-->
        <!--                         :label="renderSelectLabel(e)"-->
        <!--                         :value="e.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!-- 使用数据字典值，且显示时使用Number排序-->
        <!--          <template v-else-if="item.display && item.type === 'SELECT_BY_DICT_VALUE_SORT_NUMBER'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :placeholder="item.placeholder"-->
        <!--                :disable="!!item.readonly || readonly">-->
        <!--              <el-option v-for="e in item.options.sort((a,b)=>Number(a.value)-Number(b.value))"-->
        <!--                         :key="e.id"-->
        <!--                         :label="renderSelectLabel(e)"-->
        <!--                         :value="e.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'SELECT_BY_DICT_HIDE_VALUE_SORT_NUMBER'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :placeholder="item.placeholder"-->
        <!--                :disable="!!item.readonly || readonly">-->
        <!--              <el-option-->
        <!--                  v-for="e in item.options.sort((a,b)=>Number(a.hideData)-Number(b.hideData))"-->
        <!--                  :key="e.id"-->
        <!--                  :label="renderSelectLabel(e)"-->
        <!--                  :value="e.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->


        <!--          <template v-else-if="item.display && item.type === 'SELECT_BY_DICT_ID'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :placeholder="item.placeholder"-->
        <!--                :disable="!!item.readonly || readonly">-->
        <!--              <el-option v-for="e in item.options"-->
        <!--                         :key="e.id"-->
        <!--                         :label="e.name"-->
        <!--                         :value="e.id"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'SELECT_BY_DICT_MULTI_ID'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                multiple-->
        <!--                collapse-tags-->
        <!--                collapse-tags-tooltip-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :max-collapse-tags="5"-->
        <!--                :disable="!!item.readonly || readonly"-->
        <!--                :placeholder="item.placeholder"-->
        <!--            >-->
        <!--              <el-option v-for="e in item.options"-->
        <!--                         :key="e.id"-->
        <!--                         :label="e.name"-->
        <!--                         :value="e.id"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'CUSTOM_OPTION_SELECT_BY_DICT_VALUE'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :placeholder="item.placeholder"-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :disable="!!item.readonly || readonly">-->
        <!--              <el-option v-for="e in customOptions[item.field]"-->
        <!--                         :key="e.id"-->
        <!--                         :label="e.name"-->
        <!--                         :value="e.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'CUSTOM_OPTION_SELECT_BY_ID'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :placeholder="item.placeholder"-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :disable="!!item.readonly || readonly">-->
        <!--              <el-option v-for="e in customOptions[item.field]"-->
        <!--                         :key="e.id"-->
        <!--                         :label="e.name"-->
        <!--                         :value="e.id"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'CUSTOM_OPTION_SELECT_BY_MULTI_ID'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                multiple-->
        <!--                collapse-tags-->
        <!--                collapse-tags-tooltip-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :max-collapse-tags="5"-->
        <!--                :disable="!!item.readonly || readonly"-->
        <!--                :placeholder="item.placeholder"-->
        <!--            >-->
        <!--              <el-option v-for="item in customOptions[item.field]"-->
        <!--                         :key="item.id"-->
        <!--                         :label="item.name"-->
        <!--                         :value="item.id"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'CUSTOM_OPTION_SELECT_BY_MULTI_VALUE'">-->
        <!--            <el-select-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                multiple-->
        <!--                collapse-tags-->
        <!--                collapse-tags-tooltip-->
        <!--                clearable-->
        <!--                filterable-->
        <!--                :max-collapse-tags="5"-->
        <!--                :disable="!!item.readonly || readonly"-->
        <!--                :placeholder="item.placeholder"-->
        <!--            >-->
        <!--              <el-option v-for="item in customOptions[item.field]"-->
        <!--                         :key="item.id"-->
        <!--                         :label="item.name"-->
        <!--                         :value="item.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type ==='RATE'">-->
        <!--                     @change="stagingRate($event, item.name)"-->
        <!--            <el-rate-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                show-text-->
        <!--                :colors="['#99A9BF','#acb44b','#ECC320', '#DAD117', '#FFEA00']"-->
        <!--                :texts="item.options"-->
        <!--                :max="item.options.length"-->
        <!--                :disable="!!item.readonly || readonly"-->

        <!--            />-->
        <!--          </template>-->

        <!-- 滑块-->
        <!--          <template v-else-if="item.display && item.type ==='SLIDER'">-->
        <!--            <el-slider-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :disable="!!item.readonly || readonly"/>-->
        <!--          </template>-->

        <!-- 该type的valueType默认应为STRING-->
        <!--          <template v-else-if="item.display && item.type === 'RADIO'">-->
        <!--            <el-radio-group-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :disable="!!item.readonly || readonly">-->
        <!--              <el-radio v-for="e in item.options" :key="e.id" :value="String(e.value)"-->
        <!--                        size="large">-->
        <!--                {{ e.name }}-->
        <!--              </el-radio>-->
        <!--            </el-radio-group>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'TEXTAREA'">-->
        <!--            <el-input-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                type="textarea"-->
        <!--                :disable="!!item.readonly || readonly"-->
        <!--                :autosize="true"-->
        <!--                :placeholder="item.placeholder"-->
        <!--            />-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'TREE_CASCADE'">-->
        <!--            <el-cascader-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :placeholder="item.placeholder"-->
        <!--                :disable="item.readonly || readonly"-->
        <!--                :options="item.options"-->
        <!--            />-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'CUSTOM_OPTION_TREE_CASCADE'">-->
        <!--            <el-cascader-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :placeholder="item.placeholder"-->
        <!--                :disable="item.readonly || readonly"-->
        <!--                :props="{emitPath: false}"-->
        <!--                :options="customOptions[item.field]"-->
        <!--            />-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'CHECKBOX'">-->
        <!--            <el-checkbox-group-->
        <!--                v-model="scopeValues[item.field]">-->
        <!--              <el-checkbox v-for="(e,i) in item.options" :key="i" :label="e.name"-->
        <!--                           :value="e.value"/>-->
        <!--            </el-checkbox-group>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'TEXTAREA_JSON'">-->
        <!--            <G3JsonTextarea-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                :json-keys="item.options.map(me=>me.value)"-->
        <!--                :immediateInvalidate="immediateInvalidate(item.field)"/>-->
        <!--          </template>-->

        <!--          <template v-else-if="item.display && item.type === 'ARRAY_BY_TAG'">-->
        <!--            <G3JsonTextarea-->
        <!--                v-model="scopeValues[item.field]"-->
        <!--                array-->
        <!--                :immediateInvalidate="immediateInvalidate(item.field)"/>-->
        <!--          </template>-->

        <div v-if="validator(item)" class="g3-scope-form-error">{{ item.verifyPrompt }}</div>
      </div>
    </div>
    <div v-if="!readonly && !useFooterSlot" class="g3-scope-form-footer">
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
    scopeConfig: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    // 提供的初始数据，若存在初始数据，则使用初始数据值，否则使用默认数据值
    scopeData: {
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
    dataEffect: {
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
    const scopeKeyDetailList = ref<MetaKeyConfigWithField[]>([])
    const renderComponentMap = ref<Record<keyof MetaConfig, ShallowRef>>({})
    // 表单问题答案对象
    const scopeValues = ref<Record<keyof MetaConfig, any>>({})
    // 配置字段依赖对象
    const scopeValuesDeps = ref<Record<keyof MetaConfig, MetaConfigDependency[]>>({})
    // 原始配置字段依赖对象
    const originScopeValuesDeps = ref<Record<keyof MetaConfig, MetaKeyConfigWithField>>({})
    const scopeComponentMeta = ref({})

    // 是否需要监听值变化
    watch(props, (newValue) => {
      if (newValue.scopeConfig) {
        // 固定接口
        const scopeElement: MetaConfig = newValue.scopeConfig
        checkScopeConfig(scopeElement)

        for (const field in scopeElement) {
          const element = scopeElement[field]
          const {dependencies, ...otherField} = element
          renderComponentMap.value[field] = shallowRef(defineAsyncComponent(element.component))
          element.componentProps.disable ||= props.readonly

          if (dependencies?.length) {
            dependencies.sort((a: MetaConfigDependency, b: MetaConfigDependency) => b.priority - a.priority)
            scopeValuesDeps.value[field] = dependencies
            originScopeValuesDeps.value[field] = {field, ...otherField}
          }
        }

        scopeKeyDetailList.value = Object.entries(scopeElement)
            .map((ele) => {
              const [key, obj] = ele
              let renderValue = props.scopeData[key]
              const componentProps = obj.componentProps;
              // 根据前端显示类型提供默认值
              if (!renderValue && componentProps.valueType) {
                componentProps.defaultValue = VALUE_TYPE_MAP[componentProps.valueType](componentProps.defaultValue)
                renderValue = VALUE_TYPE_MAP[componentProps.valueType](renderValue ?? '') || componentProps.defaultValue
              }
              scopeValues.value[key] = renderValue
              return ele
            })
            .sort(([_1, v1], [_2, v2]) => v1.order - v2.order)
            // 检索依赖，替换对应元数据
            .map(item => triggerReset(Object.assign(item[1], {field: item[0]})).data)
      }
    }, {immediate: true, deep: true})

    function checkScopeConfig(ele: MetaConfig): void {
      const map = Object.keys(ele).map(field => field)
      if (new Set(map).size !== map.length) {
        throw new Error("There are field configuration items with the same 'field' in scopeConfig.")
      }
    }

    function useDisabledEffect() {
      // 禁用数据影响判定数组
      const disableEffect = ref<boolean[]>([])

      function triggerDataEffect(fieldMap: string[]) {
        for (let masterField of fieldMap) {
          if (props.dataEffect[masterField]?.length > 0) {

            const slaveFields = new Set()
            props.dataEffect[masterField].forEach((item: SlaveFieldValueMap) => {
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

      const reduceList = scopeKeyDetailList.value.map(item => {
        let changeInfo = triggerReset(item)
        hasChange ||= changeInfo.change
        return changeInfo.data
      })

      if (hasChange) {
        scopeKeyDetailList.value = reduceList
      }

      nextTick(() => {
        if (disableEffect.value.includes(true)) {
          disableEffect.value.length = 0
          return
        }
        triggerDataEffect(scopeKeyDetailList.value.map(item => item.field))
      })

    }, {deep: true})


    // 触发重新配置
    function triggerReset(data: MetaKeyConfigWithField) {

      const result = {
        change: false,
        data
      }
      const fieldDependencyList = scopeValuesDeps.value[data.field]
      if (fieldDependencyList?.length) {
        let resetScopeInfo = null
        for (const dep of fieldDependencyList) {
          const findValue = scopeValues.value[dep.depField]

          if (dep.depCondition === 'SOME' && dep.depValues.includes(findValue) ||
              dep.depCondition === 'NOT_IN' && !dep.depValues.includes(findValue) ||
              dep.depCondition === 'ALL' && dep.depValues.every(dV => dV === findValue)) {
            resetScopeInfo = dep.reset
            // 清空display、required为0的value
            const {display, required} = resetScopeInfo
            if (!display && !required) {
              scopeValues.value[data.field] = ''
            }
            break
          }
        }

        // 针对单一个字段通过
        if (resetScopeInfo) {
          result.change = true
          result.data = resetScopeInfo
        } else if (containKey(originScopeValuesDeps.value, data.field)) {
          // 恢复
          result.change = true
          result.data = originScopeValuesDeps.value[data.field]
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
      if (scopeKeyDetailList.value.some(validator.value)) {
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
      scopeKeyDetailList,
      scopeComponentMeta,
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


.g3-scope-form-props-wrapper {
  margin-bottom: 20px;
}

.g3-scope-form-footer > button {
  margin: 10px;
}

.g3-scope-form-props {
  margin-bottom: 5px;
}

.g3-scope-form-required::after {
  content: '*';
  margin: 0 5px;
  color: red;
}

.g3-scope-form-error {
  color: red;
  font-size: 12px;
  margin: 5px 0;
}

</style>
