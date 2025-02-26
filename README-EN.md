# G3ConfigForm

Customizable Dynamic Logic Form Configuration

A single configuration setup eliminates subsequent repetitive logic processing. Ideal for rapid prototyping or scenarios
requiring multiple customized pages with similar styles, significantly reducing development time.

Unlike traditional form configuration plugins, G3ConfigForm doesn't provide built-in form components. Developers can
dynamically import components through the 'component' field, supporting both custom implementations and popular UI
libraries like AntUI/ElementUI.

When using dynamically imported components, developers can initialize and control component props via the '
component/bind' field for enhanced flexibility.

## Getting Started

### Installation

```bash
# npm
npm install guava3shome-config-form

# yarn
yarn add guava3shome-config-form
```

### Key Features

- Dynamic Form Rendering: Renders form items based on keyConfig configurations
- Field Dependencies: Supports dynamic dependencies between fields with automatic updates
- Validation System: Implements required field validation and custom validation rules
- Customizable Slots: Provides flexible slot mechanisms for content customization
- Form Actions: Built-in submit/reset functionality with event communication

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
            // Referencing third-party components can also be manually encapsulated
            component: {
                body: () => import('../lib/component/G3Input.vue'),
                // Props of third-party components
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
            component: {
                body: () => import('../lib/component/G3Input.vue'),
                bind: {
                  placeholder: 'Enter password',
                  type: 'password',
                  disable: false
                }
            },
            order: 2,
            valueType: String,
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
              defaultValue: true
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

## Component Specifications

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

| Slot Name       | Description                                                       |
|-----------------|-------------------------------------------------------------------|
| `TITLE-[field]` | Replaces title                                                    |
| `_FOOTER`       | Replaces default action buttons                                   |
| `item.[field]`  | Dynamic slots bound to specific fields using their field property |

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

## Form configuration field parsing

```ts
interface MetaConfig {
    [field: string]: MetaKeyConfig
}
```

```ts
interface MetaKeyConfig {
    /**
     * Is it a fixed field (does not require display/dependency/validation)
     */
    fixed?: boolean
    title: string
    display: boolean
    /**
     * Configure whether the form item is mandatory. If it is empty, an error message will be displayed and submission cannot be made
     */
    required: {
        value: boolean
        message: string
        /**
         * Should a verification be performed immediately after the form rendering is completed; Default value true
         */
        immediate?: boolean
    }

    /**
     * Form Item Component
     */
    component: {
        body: () => Promise<Component> | Component
        /**
         *  Custom form item component props properties
         */
        bind?: {
            [key: string]: any
        }
    }

    order: number

    /**
     * If there is an initial value in the keyData field of props, do not use that field value
     */
    defaultValue?: any

    /**
     * Default value type
     */
    valueType?: ((value?: any) => string)   // => String
              | ((value?: any) => number)   // => Number
              | ((value?: any) => boolean)  // => Boolean
              | ((value?: any) => any[])    // => Array
              | ((value?: any) => object);  // => Object

    /**
     * Validator, enhances required configuration, supports function and object configuration
     * When there are both required and validator fields present, the required and validator field information will be validated sequentially
     */
    validator?: (value: any, success: SuccessCallback, fail: FailCallback, props: {
        [key: string]: any
    }) => Promise<void> | {
        /**
         * Verification function
         * @param value Form item value
         * @param success The success signal function executes success() when the verification is successful
         * @param fail Failure signal function, execute fail (message: string) when verification fails
         * @param props The props of the component referenced by this form item provide dynamic change functionality during verification
         */
        validate: (value: any, success: SuccessCallback, fail: FailCallback, props: {
            [key: string]: any
        }) => Promise<void>

        /**
         * Trigger type, triggered by the change/blur action; Default value change
         * change: Triggered when the value of the form item changes
         * blur： Triggered when the form item loses focus
         */
        triggerType?: TriggerType

        /**
         * Trigger delay, the time range used for anti shake function; Default value 100
         */
        triggerDelay?: number

        /**
         * Should a verification be performed immediately after the form rendering is completed; Default value true
         */
        immediate?: boolean

        /**
         * Trigger scope, validation is only valid when applied to item/submit, default value 'single'
         * single： Only verify the current field
         * propagation： Validate all fields
         */
        scope?: 'single' | 'propagation'
    }

    /**
     * Backup options, suitable for components such as selectors, single selection, multiple selection, cascading, etc
     */
    options?: {
        [key: string]: string | number
    }[] | ((field: keyForString<MetaConfig>) => Promise<{
        [key: string]: string | number
    }[]>)

    /**
     * Configure the dependency relationship between form items, such as fields A and B. Configure a dependency field for field B to indicate that all behaviors, display modes, etc. of field B are affected by changes in the value of the dependency field
     */
    readonly dependencies?: {
        /**
         * The field name that this form item depends on
         */
        depField: keyof MetaConfig

        /**
         * The values that can be influenced by dependent fields
         */
        depValues: string[]

        /**
         * Determine the condition by judging the value of the dependent field based on this condition. If it is met, assign the reset object as a new configuration to this table item
         * some:  The appearance of dependent field values in depValues satisfies the condition
         * not_in: If the dependent field value does not appear in depValues, the condition is met
         * all:  If all dependent field values (array values) appear in depValues, the condition is met
         */
        depCondition: 'some' | 'not_in' | 'all'

        /**
         * The priority of the dependency in the set
         */
        priority: number

        /**
         * Reset configuration items
         */
        reset: {
            title: string
            display: boolean
            /**
             * Configure whether the form item is mandatory. If it is empty, an error message will be displayed and submission cannot be made
             */
            required: {
                value: boolean
                message: string
                /**
                 * Should a verification be performed immediately after the form rendering is completed; Default value true
                 */
                immediate?: boolean
            }

            /**
             * Form Item Component
             */
            component: {
                body: () => Promise<Component> | Component
                /**
                 *  Custom form item component props properties
                 */
                bind?: {
                    [key: string]: any
                }
            }

            order: number

            /**
             * If there is an initial value in the keyData field of props, do not use that field value
             */
            defaultValue?: any

            /**
             * Default value type
             */
            valueType?: ((value?: any) => string)   // => String
                      | ((value?: any) => number)   // => Number
                      | ((value?: any) => boolean)  // => Boolean
                      | ((value?: any) => any[])    // => Array
                      | ((value?: any) => object);  // => Object

            /**
             * Validator, enhances required configuration, supports function and object configuration
             * When there are both required and validator fields present, the required and validator field information will be validated sequentially
             */
            validator?: (value: any, success: SuccessCallback, fail: FailCallback, props: {
                [key: string]: any
            }) => Promise<void> | {
                /**
                 * Verification function
                 * @param value Form item value
                 * @param success The success signal function executes success() when the verification is successful
                 * @param fail Failure signal function, execute fail (message: string) when verification fails
                 * @param props The props of the component referenced by this form item provide dynamic change functionality during verification
                 */
                validate: (value: any, success: SuccessCallback, fail: FailCallback, props: {
                    [key: string]: any
                }) => Promise<void>

                /**
                 * Trigger type, triggered by the change/blur action; Default value change
                 * change: Triggered when the value of the form item changes
                 * blur： Triggered when the form item loses focus
                 */
                triggerType?: TriggerType

                /**
                 * Trigger delay, the time range used for anti shake function; Default value 100
                 */
                triggerDelay?: number

                /**
                 * Should a verification be performed immediately after the form rendering is completed; Default value true
                 */
                immediate?: boolean

                /**
                 * Trigger scope, validation is only valid when applied to item/submit, default value 'single'
                 * single： Only verify the current field
                 * propagation： Validate all fields
                 */
                scope?: 'single' | 'propagation'
            }

            /**
             * Backup options, suitable for components such as selectors, single selection, multiple selection, cascading, etc
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
