# G3ConfigForm

Customizable Dynamic Logic Form Configuration

A single configuration setup eliminates subsequent repetitive logic processing. Ideal for rapid prototyping or scenarios
requiring multiple customized pages with similar styles, significantly reducing development time.

Unlike traditional form configuration plugins, G3ConfigForm doesn't provide built-in form components. Developers can
dynamically import components through the 'component' field, supporting both custom implementations and popular UI
libraries like AntUI/ElementUI.

When using dynamically imported components, developers can initialize and control component props via the '
componentProps' field for enhanced flexibility.

## Getting Started

### Installation

```bash
# npm
npm install guava3shome-config-form

# yarn
yarn add guava3shome-config-form
```

### Component Integration

Global Registration

```js
import {createApp} from 'vue'
import App from './App.vue'
import G3ConfigForm from "guava3shome-config-form"
import 'guava3shome-config-form/dist/index.css'

const app = createApp(App)
app.use(G3ConfigForm)
app.mount('#app')
```

### Implementation Example

```vue

<template>
  <G3ConfigForm :keyConfig="G3ConfigForm" :before-submit="beforeSubmit" @submit="submit">
    <!--Subcompoonent extension, slot name is equivalent to field name -->
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
                  fail('Username length must be ≤32 characters')
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
              placeholder: 'Enter password',
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
            // Referencing third-party components can also be manually encapsulated
            component: () => import('element-plus/es/components/select/index.mjs').then(m => m.ElSelect),
            order: 3,
            valueType: 'number',
            // Props of third-party components
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
        // Before submission: Mask layer/DOM linkage/Other requests
        resolve()
      },
      submit(data) {
        // The data is the data after successful verification
      }
    }
  }
</script>
```

### Key Features

- Dynamic Form Rendering: Renders form items based on keyConfig configurations
- Field Dependencies: Supports dynamic dependencies between fields with automatic updates
- Validation System: Implements required field validation and custom validation rules
- Customizable Slots: Provides flexible slot mechanisms for content customization
- Form Actions: Built-in submit/reset functionality with event communication

### Component Specifications

#### Props

| Property        | Type       | Default	 | Description                                                                                              |
|-----------------|------------|----------|----------------------------------------------------------------------------------------------------------|
| `keyConfig`     | `Object`   | `{}`     | Configuration object containing field details (title, required status, default values, etc.)             |
| `keyData`       | `Object`   | `{}`     | Initial form data (overrides keyConfig defaults when provided)                                           |
| `readonly`      | `Boolean`  | `false`  | Read-only mode toggle                                                                                    |
| `keyDataEffect` | `Object`   | `{}`     | Master-slave field relationships: {[masterField: string]: Array<{slaveField: string, valueMap: Object}>} |
| `beforeSubmit`  | `Function` | `()=>{}` | Pre-submission hook (executes before validation)                                                         

#### Events

| Event    | Parameters                  | Description	                |
|----------|-----------------------------|-----------------------------|
| `submit` | `data: Record<string, any>` | Triggers on form submission |
| `cancel` | `-`                         | Triggers on form reset      |

#### Slots

| Slot Name      | Description                                                       |
|----------------|-------------------------------------------------------------------|
| `footer`       | Replaces default action buttons when useFooterSlot=true           |
| `item.[field]` | Dynamic slots bound to specific fields using their field property |

### Validation System

Configure validation through required and validator properties:

#### Required Field

```ts
interface RequiredDescValidator {
    value: boolean
    message: string
    immediate?: boolean  // Default: true
}
```

#### Enhanced Validation

```ts
interface InputValidator {
    validate: (
        value: any,
        success: () => void,
        fail: (msg: string) => void,
        props: MetaKeyComponentProps
    ) => Promise<void>

    triggerType?: 'change' | 'blur'    // Default: 'change'
    triggerDelay?: number              // Debounce time (ms), default: 200
    immediate?: boolean                // Default: true
    scope?: ('item' | 'submit')[]      // Default: ['item', 'submit']
}
```

Validation sequence: required checks execute before validator when both exist.

### Dependency Management

Configure field dependencies using dependencies[]:

```ts
interface MetaConfigDependency {
    depField: keyof MetaConfig
    depValues: string[]
    depCondition: 'some' | 'not_in' | 'all'
    priority: number
    reset: {
        title: string
        display: boolean
        required: RequiredDescValidator
        component: () => Promise<Component>
        componentProps: MetaKeyComponentProps
        order: number
        defaultValue?: Primitive | Array<Primitive>
        valueType?: DataType
        validator?: InputValidator
        options?: MetaOptionConfig[] | ((field: string) => Promise<MetaOptionConfig[]>)
    }
}
```

### Data Relationships

Define lightweight master-slave field relationships via keyDataEffect:

```js
keyDataEffect = {
    masterField: [{
        slaveField: 'slaveField1',
        valueMap: {
            'value1': 'slaveValue1',
            'value2': 'slaveValue2'
        }
    }]
};
```
