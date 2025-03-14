# G3ConfigForm

自定义配置动态逻辑表单

仅需一次配置，之后涉及到的逻辑处理几乎可以省略。在一些需要快速实验，或大量定制化需求、风格相近页面上，能够较快节约开发时间。

与传统的表单配置插件不同，G3ConfigForm没有提供表单项组件。表单内的所有表单项完全由开发者通过 'component'
字段进行导入，可以是开发者按照自己风格开发的组件，
也可以是市面上的常见的AntUI/ElementUI等。

且表单项组件在由开发者动态引入的情况下，可以通过 'component/bind' 字段对目标表单项组件的props进行初始化赋值以及后续相关控制。

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
            // 引用第三方组件，也可进行手动封装
            component: {
              body: () => import('../lib/component/G3Input.vue'),
              // 第三方组件的props
              bind: {
                placeholder: 'Please input name',
                type: 'text',
                disable: false
              }
            },
            order: 1,
            valueType: String,
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
            component: {
              body: () => import('../lib/component/G3Input.vue'),
              bind: {
                placeholder: 'your password',
                type: 'password',
                disable: false
              }
            },
            order: 2,
            valueType: String,
            dependencies: [
              {
                depField: 'name',
                depCondition: 'some',
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
            component: {
              body: () => import('element-plus/es/components/select/index.mjs').then(m => m.ElSelect),
              bind: {
                placeholder: 'Please select your gender',
              }
            },
            order: 3,
            valueType: Number,
            options: [
              {label: 'Male', value: 1},
              {label: 'Female', value: 0}
            ]
          },
          system: {
            fixed: true,
            defaultValue: true,
            valueType: Boolean
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
| `immediate`     | `Boolean`  | `true`   | 全局配置是否立即执行校验，默认为true；当其设置为false，且单独配置field的immediate为true，则不受全局配置影响                                                         |

### Event

| 事件       | 参数                          | 说明              |
|----------|-----------------------------|-----------------|
| `submit` | `data: Record<string, any>` | 表单提交时触发，传递表单的值。 |
| `cancel` | 无                           | 表单重置时触发。        |

### Slot

| 插槽名称            | 说明                              |
|-----------------|---------------------------------|
| `TITLE-[field]` | 标题插槽。                           |
| `_FOOTER`       | 替代默认的提交按钮。                      |
| `item.field`    | 动态生成的插槽，依据每个字段的 `field` 属性名来绑定。 |

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

```ts
interface MetaConfig {
    [field: string]: MetaKeyConfig
}
```

```ts
interface MetaKeyConfig {
    /**
     * 是否为固定字段（不需要显示/依赖/校验）
     */
    fixed?: boolean

    /**
     * 标题
     */
    title: string

    /**
     * 是否显示
     */
    display: boolean

    /**
     * 配置该表单项是否为必填项，为空时会显示错误提示，无法进行提交
     */
    required: {
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

    /**
     * 表单项组件 <=>MetaConfigComponent
     */
    component: {
        body: () => Promise<Component> | Component
        /**
         * 自定义表单项组件props属性
         */
        bind?: {
            [key: string]: any
        }
        children?: MetaConfigComponent[]
    }

    /**
     * 配置顺序
     */
    order: number

    /**
     * 默认值，若是在props的keyData存在字段初始值，则不使用该字段值
     */
    defaultValue?: any

    /**
     * 默认值类型
     */
    valueType: ((value?: any) => string)   // 对应 String
        | ((value?: any) => number)   // 对应 Number
        | ((value?: any) => boolean)  // 对应 Boolean
        | ((value?: any) => any[])    // 对应 Array
        | ((value?: any) => object);  // 对应 Object

    /**
     * 提交时数据转换
     */
    submitConvert?: (value: any) => any

    /**
     * 校验器，对required配置进行增强，支持函数与对象配置
     * 当同时存在required与validator字段时，会依次对required、validator字段信息进行校验
     */
    validator?: (value: any, success: SuccessCallback, fail: FailCallback, props: {
        [key: string]: any
    }) => Promise<void> | {
        /**
         * 校验函数
         * @param value 表单项值
         * @param success 成功信号函数，在校验成功时执行 success()
         * @param fail 失败信号函数，在校验失败时执行 fail(message: string)
         * @param props 该表单项所引用组件的props，提供校验时动态更改功能
         */
        validate: (value: any, success: SuccessCallback, fail: FailCallback, props: {
            [key: string]: any
        }) => Promise<void>

        /**
         * 触发类型，因change/blur动作而触发；默认值 change
         * change：该表单项值发生变化时触发
         * blur：该表单项失焦后触发
         */
        triggerType?: 'change' | 'blur'

        /**
         * 触发延时，用于防抖功能的时间范围；默认值 100
         */
        triggerDelay?: number

        /**
         * 是否在表单渲染完成后立即进行一次校验；默认值 true
         */
        immediate?: boolean

        /**
         * 触发作用域，校验仅作用于item/submit时有效，默认值 single
         * single： 仅校验当前字段
         * propagation： 对所有字段进行校验
         */
        scope?: 'single' | 'propagation'
    }

    /**
     * 备用选项，适用于选择器、单选、多选、级联等组件
     */
    options?: {
        [key: string]: string | number
    }[] | ((field: keyForString<MetaConfig>) => Promise<{
        [key: string]: string | number
    }[]>)

    /**
     * 配置表单项之间的依赖关系，例如A、B字段，对B字段配置依赖字段，表明B字段的所有行为、显示方式等都受到该依赖字段值变化的影响
     */
    readonly dependencies?: {
        /**
         * 该表单项所依赖的字段名
         */
        depField: keyof MetaConfig

        /**
         * 依赖字段能够产生影响的值
         */
        depValues: Array<string | number | boolean>

        /**
         * 判断条件，根据该条件对依赖字段的值进行判断，若是满足则将 reset 对象作为新配置赋予给此表单项
         * some: 依赖字段值在 depValues 中出现即满足条件
         * not_in: 依赖字段值不在 depValues 中出现即满足条件
         * all: 依赖字段值（数组值）全部出现 depValues 中出现即满足条件
         *
         * 也可以自定义判断函数，target为当前字段值，values为depValues值
         */
        depCondition: 'some' | 'not_in' | 'all' | ((target: any, values: Array<string | number | boolean>) => boolean)

        /**
         * 该依赖在集合中的优先级；数值越大，优先级越高
         */
        priority: number

        /**
         * 重置配置项
         */
        reset: {
            /**
             * 标题
             */
            title: string

            /**
             * 是否显示
             */
            display: boolean

            /**
             * 配置该表单项是否为必填项，为空时会显示错误提示，无法进行提交
             */
            required: {
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

            /**
             * 表单项组件<=>MetaConfigComponent
             */
            component: {
                body: () => Promise<Component> | Component
                /**
                 * 自定义表单项组件props属性
                 */
                bind?: {
                    [key: string]: any
                }
                children?: MetaConfigComponent[]
            }

            /**
             * 配置顺序
             */
            order: number

            /**
             * 默认值，若是在props的keyData存在字段初始值，则不使用该字段值
             */
            defaultValue?: any

            /**
             * 默认值类型
             */
            valueType: ((value?: any) => string)   // 对应 String
                | ((value?: any) => number)   // 对应 Number
                | ((value?: any) => boolean)  // 对应 Boolean
                | ((value?: any) => any[])    // 对应 Array
                | ((value?: any) => object);  // 对应 Object

            /**
             * 提交时数据转换
             */
            submitConvert?: (value: any) => any

            /**
             * 校验器，对required配置进行增强，支持函数与对象配置
             * 当同时存在required与validator字段时，会依次对required、validator字段信息进行校验
             */
            validator?: (value: any, success: SuccessCallback, fail: FailCallback, props: {
                [key: string]: any
            }) => Promise<void> | {
                /**
                 * 校验函数
                 * @param value 表单项值
                 * @param success 成功信号函数，在校验成功时执行 success()
                 * @param fail 失败信号函数，在校验失败时执行 fail(message: string)
                 * @param props 该表单项所引用组件的props，提供校验时动态更改功能
                 */
                validate: (value: any, success: SuccessCallback, fail: FailCallback, props: {
                    [key: string]: any
                }) => Promise<void>

                /**
                 * 触发类型，因change/blur动作而触发；默认值 change
                 * change：该表单项值发生变化时触发
                 * blur：该表单项失焦后触发
                 */
                triggerType?: 'change' | 'blur'

                /**
                 * 触发延时，用于防抖功能的时间范围；默认值 100
                 */
                triggerDelay?: number

                /**
                 * 是否在表单渲染完成后立即进行一次校验；默认值 true
                 */
                immediate?: boolean

                /**
                 * 触发作用域，校验仅作用于item/submit时有效，默认值 single
                 * single： 仅校验当前字段
                 * propagation： 对所有字段进行校验
                 */
                scope?: 'single' | 'propagation'
            }

            /**
             * 备用选项，适用于选择器、单选、多选、级联等组件
             */
            options?: {
                [key: string]: string | number
            }[] | ((field: keyForString<MetaConfig>) => Promise<{
                [key: string]: string | number
            }[]>)
        }
    }[]
}
```
