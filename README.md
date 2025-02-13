# G3ConfigForm

自定义配置动态逻辑表单

仅需一次配置，之后涉及到的逻辑处理几乎可以省略。在一些需要快速实验，或大量定制化需求、风格相近页面上，能够较快节约开发时间。

与传统的表单配置插件不同，G3ConfigForm没有提供表单项组件。表单内的所有表单项完全由开发者通过 'component'
字段进行导入，可以是开发者按照自己风格开发的组件，
也可以是市面上的常见的AntUI/ElementUI等。

且表单项组件在由开发者动态引入的情况下，可以通过 'componentProps' 字段对目标表单项组件的props进行初始化赋值以及后续相关控制。

## 快速开始

### 1、安装

```bash
# npm install
npm install guava3shome-config-form

# yarn install
yarn add guava3shome-config-form
```

### 2、组件使用

#### 全局安装

```js
import {createApp} from 'vue'
import App from './App.vue'
import G3ConfigForm from "guava3shome-config-form"
import 'guava3shome-config-form/dist/index.css'

const app = createApp(App)
app.use(G3ConfigForm)
app.mount('#app')
```

### 3、使用案例

```vue

<template>
  <G3ConfigForm :keyConfig="G3ConfigForm" :before-submit="beforeSubmit" @submit="submit">
    <!--子组件拓展，插槽名即字段名 -->
    <template #gender="data">
      <el-option v-for="(item,i) in data.scope.options"
                 :key="i"
                 :label="item.label"
                 :value="item.value">
      </el-option>
    </template>
  </G3ConfigForm>
</template>

<script>
  export default {
    components: {
      G3ConfigForm
    },
    data() {
      return {
        keyConfig: {
          name: {
            title: 'Username',
            display: true,
            required: {
              value: true,
              message: 'Please input name'
            },
            component: () => import('../lib/component/G3Input.vue'),
            order: 1,
            valueType: 'STRING',
            componentProps: {
              placeholder: 'Please input name',
              type: 'text',
              disable: false
            },
            validator: {
              triggerType: 'change',
              triggerDelay: 0,
              validate: async (value, success, fail) => {
                if (value.length > 32) {
                  fail('The username length should not exceed 32.')
                }

                success()
              }
            },
          },
          password: {
            title: 'Password',
            display: true,
            required: {
              value: true,
              message: 'Please input password'
            },
            component: () => import('../lib/component/G3Input.vue'),
            order: 2,
            valueType: 'STRING',
            componentProps: {
              placeholder: 'your password',
              type: 'password',
              disable: false
            },
            dependencies: [
              {
                depField: 'name',
                depCondition: 'SOME',
                depValues: ['SYSTEM'],
                priority: 1,
                reset: {
                  display: false,
                  required: {
                    value: false,
                    message: 'Please input password'
                  },
                }
              }
            ]
          },
          gender: {
            title: 'Gender',
            display: true,
            required: {
              value: true,
              message: 'Gender cannot be empty.'
            },
            // 引用第三方组件，也可进行手动封装
            component: () => import('element-plus/es/components/select/index.mjs').then(m => m.ElSelect),
            order: 3,
            valueType: 'number',
            // 第三方组件的props
            componentProps: {
              placeholder: 'Please select your gender',
            },
            options: [
              {label: 'Male', value: 1},
              {label: 'Female', value: 0}
            ]
          }
        }
      }
    },
    methods: {
      beforeSubmit(resolve, reject) {
        // 提交前 eg: 遮罩层/dom联动/其他请求...
        resolve()
      },
      submit(data) {
        // data为校验成功后的数据
      }
    }
  }
</script>

```

### Features

- **动态渲染表单项**：根据 `keyConfig` 配置动态渲染表单项。
- **字段依赖**：支持字段间的动态依赖关系，数据变化时自动更新相关字段。
- **表单验证**：支持必填字段验证，提交时进行自定义规则表单校验。
- **自定义插槽**：提供灵活的插槽机制，允许用户自定义内容。
- **提交与重置功能**：提供表单提交和重置功能，并通过事件与父组件通信。

## 组件详情

### Props

| 属性              | 类型         | 默认值      | 说明                                                                                                                          |
|-----------------|------------|----------|-----------------------------------------------------------------------------------------------------------------------------|
| `keyConfig`     | `Object`   | `{}`     | 表单项的配置，包含每个字段的配置信息，如标题、是否必填、默认值等。                                                                                           |
| `keyData`       | `Object`   | `{}`     | 表单项的初始数据，若提供了该字段则使用初始数据，否则使用 `keyConfig` 中的默认值。                                                                             |
| `readonly`      | `Boolean`  | `false`  | 是否为只读模式，默认为 `false`，在该模式下表单项不可编辑。                                                                                           |
| `keyDataEffect` | `Object`   | `{}`     | 字段数据之间的影响规则，格式为 `{[masterField: string]: Array<{slaveField: string, valueMap: {mFValue1: sFValue1, ...}}>`，指定数据变化时如何影响其他字段。 |
| `beforeSubmit`  | `Function` | `()=>{}` | 在表单提交前执行函数（此时还未进行校验）                                                                                                        |

### Event

| 事件       | 参数                          | 说明              |
|----------|-----------------------------|-----------------|
| `submit` | `data: Record<string, any>` | 表单提交时触发，传递表单的值。 |
| `cancel` | 无                           | 表单重置时触发。        |

### Slot

| 插槽名称           | 说明                                              |
|----------------|-------------------------------------------------|
| `FOOTER` | 如果 `useFooterSlot` 为 `true`，则使用此插槽替代默认的提交和取消按钮。 |
| `item.field`   | 动态生成的插槽，依据每个字段的 `field` 属性名来绑定。                 |

### Data Effect

通过 `keyDataEffect` props属性，定义主从字段之间的依赖关系。例如，当主字段的值变化时，可以触发从字段的变化；是轻量级的依赖。

```js
 keyDataEffect = {
    masterField: [
        {
            slaveField: 'slaveField1',
            valueMap: {
                'value1': 'slaveValue1',
                'value2': 'slaveValue2',
            },
        },
    ],
};
```


## 表单配置字段解析
### Validate

表单校验从可以从两个属性(required/validator)进行配置

#### required

配置该表单项是否为必填项，为空时会显示错误提示，无法进行提交

```ts
interface RequiredDescValidator {
    /**
     * required值
     */
    value: boolean
    /**
     * 提示消息
     */
    message: string
    /**
     * 是否在表单渲染完成后立即进行一次校验；默认值 true
     */
    immediate?: boolean
}
```

#### validator

可选字段，对required进行增强

```ts
interface InputValidator {
    /**
     * 校验函数
     * @param value 表单项值
     * @param success 成功信号函数，在校验成功时执行 success()
     * @param fail 失败信号函数，在校验失败时执行 fail(message: string)
     * @param props 该表单项所引用组件的props，提供校验时动态更改功能
     */
    validate: (value: any, success: SuccessCallback, fail: FailCallback, props: MetaKeyComponentProps) => Promise<void>

    /**
     * 触发类型，因change/blur动作而触发；默认值 change
     * change：该表单项值发生变化时触发
     * blur：该表单项失焦后触发
     */
    triggerType?: TriggerType

    /**
     * 触发延时，用于防抖功能的时间范围；默认值 200
     */
    triggerDelay?: number

    /**
     * 是否在表单渲染完成后立即进行一次校验；默认值 true
     */
    immediate?: boolean

    /**
     * 触发作用域，校验仅作用于item/submit时有效，默认值 [item, submit]
     * single： 表单项，若无配置item，则该表单项值变化时不会触发校验
     * propagation： 提交表单时
     */
    scope?: TriggerScope
}
```

当同时存在required与validator字段时，会依次对required、validator字段信息进行校验

### Dependency

使用 dependencies[] 字段配置表单项之间的依赖关系，例如A、B字段，对B字段配置依赖字段，表明B字段的所有行为、显示方式等都受到该依赖字段值变化的影响

```ts
import {MetaConfig} from "./meta-config";

interface MetaConfigDependency {
    /**
     * 该表单项所依赖的字段名
     */
    depField: keyof MetaConfig

    /**
     * 依赖字段能够产生影响的值
     */
    depValues: string[]

    /**
     * 判断条件，根据该条件对依赖字段的值进行判断，若是满足则将 reset 对象作为新配置赋予给此表单项
     * some: 依赖字段值在 depValues 中出现即满足条件
     * not_in: 依赖字段值不在 depValues 中出现即满足条件
     * all: 依赖字段值（数组值）全部出现 depValues 中出现即满足条件
     */
    depCondition: 'some' | 'not_in' | 'all'

    /**
     * 该依赖在集合中的优先级
     */
    priority: number

    /**
     * 重置配置项
     */
    reset: {
        /**
         * 表单项标题
         */
        title: string

        /**
         * 表单项是否显示
         */
        display: boolean

        /**
         * 是否为必填项
         */
        required: RequiredDescValidator

        /**
         * 表单项实例组件
         */
        component: () => Promise<Component>

        /**
         * 表单项实例组件props对象
         */
        componentProps: MetaKeyComponentProps

        /**
         * 表单项顺序
         */
        order: number

        /**
         * 默认值
         */
        defaultValue?: string | number | boolean | string[] | number[] | boolean[]

        /**
         * 值类型，用于增强数据类型准确性
         */
        valueType?: 'string' | 'number' | 'boolean' | 'base_array'

        /**
         * 校验器
         * ValidateFunction最终会转换为主要类型InputValidator
         */
        validator?: InputValidator | ValidateFunction

        /**
         * 用于动态获取字典值
         */
        options?: MetaOptionConfig[] | ((field: keyof MetaConfig) => Promise<MetaOptionConfig[]>)
    }
}
```
