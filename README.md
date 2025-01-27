Customized configuration dynamic logic form

- Allow developers to dynamically generate form items based on configuration, and provide features such as validation, dependency relationships, submission, and reset. 
- It supports multiple configuration options to help simplify the form building process.


## Getting Start

### 1、Install
```bash
# npm install
npm install guava3shome-config-form

# yarn install
yarn add guava3shome-config-form
```

### 2、Introduce component

#### Global

```js
import { createApp } from 'vue'
import App from './App.vue'
import G3ConfigForm from "guava3shome-config-form"

const app = createApp(App)
app.use(G3ConfigForm)
app.mount('#app')
```


### 3、Case
```vue

<template>
  <G3ConfigForm :keyConfig="keyConfig"/>
</template>

<script>
  import G3ScopeForm from 'g3-scope-form'

  export default {
    components: {
      G3ScopeForm
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
              triggerType: TriggerType.change,
              triggerDelay: 0,
              validate: async (value) => {
                if (value.length > 32) {
                  return {
                    success: false,
                    message: 'The username length should not exceed 32.'
                  }
                }

                return
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
                  required: false
                }
              }
            ]
          }
        }
      }
    }
  }
</script>
```


## Features

- **动态渲染表单项**：根据 `keyConfig` 配置动态渲染表单项。
- **字段依赖**：支持字段间的动态依赖关系，数据变化时自动更新相关字段。
- **表单验证**：支持必填字段验证，提交时进行表单校验。
- **自定义插槽**：提供灵活的插槽机制，允许用户自定义内容。
- **提交与重置功能**：提供表单提交和重置功能，并通过事件与父组件通信。
- **自定义选项**：支持 `select` 等字段的自定义选项配置。

## Component Detail

### Props

| 属性            | 类型      | 默认值  | 说明                                                         |
| --------------- | --------- | ------- | ------------------------------------------------------------ |
| `keyConfig`     | `Object`  | `{}`    | 表单项的配置，包含每个字段的配置信息，如标题、是否必填、默认值等。 |
| `keyData`       | `Object`  | `{}`    | 表单项的初始数据，若提供了该字段则使用初始数据，否则使用 `keyConfig` 中的默认值。 |
| `readonly`      | `Boolean` | `false` | 是否为只读模式，默认为 `false`，在该模式下表单项不可编辑。   |
| `customOptions` | `Object`  | `{}`    | 自定义选项，格式为 `{[field: string]: Array<MetaOptionConfig>}`，可以为某些字段提供自定义选项。 |
| `keyDataEffect` | `Object`  | `{}`    | 字段数据之间的影响规则，格式为 `{[masterField: string]: Array<{slaveField: string, valueMap: {mFValue1: sFValue1, ...}}>`，指定数据变化时如何影响其他字段。 |
| `useFooterSlot` | `Boolean` | `false` | 是否使用自定义底部插槽，默认为 `false`。设置为 `true` 时，将替代默认的提交和取消按钮。 |

### Event

| 事件     | 参数                        | 说明                           |
| -------- | --------------------------- | ------------------------------ |
| `submit` | `data: Record<string, any>` | 表单提交时触发，传递表单的值。 |
| `cancel` | 无                          | 表单重置时触发。               |

### Slot

| 插槽名称     | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| `default`    | 用于渲染表单项。                                             |
| `footer`     | 如果 `useFooterSlot` 为 `true`，则使用此插槽替代默认的提交和取消按钮。 |
| `item.field` | 动态生成的插槽，依据每个字段的 `field` 属性名来绑定。        |

### Validate

每个表单项都可以通过 `required` 属性设置为必填项，提交时会校验表单项的值。如果必填字段未填写，会显示错误提示。

```
tsCopyEditfunction validate(item: MetaKeyConfigWithField): boolean {
  const fieldValue = scopeValues.value[item.field];
  return (item.required && (['null', 'undefined', ''].includes(String(fieldValue))))
}
```

### Dependency & Data Effect

通过 `keyDataEffect` 属性，定义主从字段之间的依赖关系。例如，当主字段的值变化时，可以触发从字段的变化。

```
tsCopyEditconst keyDataEffect = {
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
