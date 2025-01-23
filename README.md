

```
markdownCopyEdit# G3ScopeForm

`G3ScopeForm` 允许开发者根据配置动态生成表单项，并提供验证、依赖关系、提交和重置等功能。它支持多种配置选项，帮助简化表单构建过程。

## 特性

- **动态渲染表单项**：根据 `keyConfig` 配置动态渲染表单项。
- **字段依赖**：支持字段间的动态依赖关系，数据变化时自动更新相关字段。
- **表单验证**：支持必填字段验证，提交时进行表单校验。
- **自定义插槽**：提供灵活的插槽机制，允许用户自定义内容。
- **提交与重置功能**：提供表单提交和重置功能，并通过事件与父组件通信。
- **自定义选项**：支持 `select` 等字段的自定义选项配置。

## 安装

### 使用 npm 安装

```bash
npm install guava3shome-scope-form
```

### 使用 yarn 安装

```
bash


CopyEdit
yarn add guava3shome-scope-form
```

## 使用

### 基本用法

```
vueCopyEdit<template>
  <G3ScopeForm 
    :keyConfig="keyConfig" 
    :keyData="keyData" 
    :readonly="false"
    :useFooterSlot="true"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>

<script lang="ts">
import G3ScopeForm from 'g3-scope-form'

export default {
  components: {
    G3ScopeForm
  },
  data() {
    return {
      keyConfig: {
        username: {
          title: 'Username',
          required: true,
          component: 'el-input',
          componentProps: { placeholder: 'Enter your username' },
        },
        email: {
          title: 'Email',
          required: true,
          component: 'el-input',
          componentProps: { placeholder: 'Enter your email' },
        }
      },
      keyData: {
        username: 'john_doe',
        email: 'john@example.com',
      }
    }
  },
  methods: {
    handleSubmit(data) {
      console.log('Form submitted with data:', data)
    },
    handleCancel() {
      console.log('Form reset')
    }
  }
}
</script>
```

### 组件属性

| 属性            | 类型      | 默认值  | 说明                                                         |
| --------------- | --------- | ------- | ------------------------------------------------------------ |
| `keyConfig`     | `Object`  | `{}`    | 表单项的配置，包含每个字段的配置信息，如标题、是否必填、默认值等。 |
| `keyData`       | `Object`  | `{}`    | 表单项的初始数据，若提供了该字段则使用初始数据，否则使用 `keyConfig` 中的默认值。 |
| `readonly`      | `Boolean` | `false` | 是否为只读模式，默认为 `false`，在该模式下表单项不可编辑。   |
| `customOptions` | `Object`  | `{}`    | 自定义选项，格式为 `{[field: string]: Array<MetaOptionConfig>}`，可以为某些字段提供自定义选项。 |
| `keyDataEffect` | `Object`  | `{}`    | 字段数据之间的影响规则，格式为 `{[masterField: string]: Array<{slaveField: string, valueMap: {mFValue1: sFValue1, ...}}>`，指定数据变化时如何影响其他字段。 |
| `useFooterSlot` | `Boolean` | `false` | 是否使用自定义底部插槽，默认为 `false`。设置为 `true` 时，将替代默认的提交和取消按钮。 |

### 组件事件

| 事件     | 参数                        | 说明                           |
| -------- | --------------------------- | ------------------------------ |
| `submit` | `data: Record<string, any>` | 表单提交时触发，传递表单的值。 |
| `cancel` | 无                          | 表单重置时触发。               |

### 插槽

| 插槽名称     | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| `default`    | 用于渲染表单项。                                             |
| `footer`     | 如果 `useFooterSlot` 为 `true`，则使用此插槽替代默认的提交和取消按钮。 |
| `item.field` | 动态生成的插槽，依据每个字段的 `field` 属性名来绑定。        |

### 表单验证

每个表单项都可以通过 `required` 属性设置为必填项，提交时会校验表单项的值。如果必填字段未填写，会显示错误提示。

```
tsCopyEditfunction validate(item: MetaKeyConfigWithField): boolean {
  const fieldValue = scopeValues.value[item.field];
  return (item.required && (['null', 'undefined', ''].includes(String(fieldValue))))
}
```

### 字段依赖关系

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

### 提交和重置表单

组件提供了 `submit` 和 `resetScopeForm` 两个方法，分别用于提交表单和重置表单。

```
tsCopyEditfunction submit() {
  const formData = JSON.parse(JSON.stringify(scopeValues.value));
  if (keyConfigList.value.some(validator.value)) {
    return;
  }
  !props.useFooterSlot && emit('submit', formData);
}

function resetScopeForm() {
  Object.keys(scopeValues.value).forEach(key => scopeValues.value[key] = '');
  !props.useFooterSlot && emit('cancel');
}
```

------

## 样式说明

组件内置了一些样式，用于渲染表单项、错误提示、必填标记等。你可以根据需要进行定制。

- `.g3-scope-form-props-wrapper`: 表单项外层容器。
- `.g3-scope-form-footer > button`: 提交和重置按钮的样式。
- `.g3-scope-form-props`: 表单项的标题样式。
- `.g3-scope-form-required`: 为必填项添加星号样式。
- `.g3-scope-form-error`: 表单验证失败时显示的错误提示。
