<script setup lang="ts">
import G3ConfigForm from "../lib/G3ConfigForm.vue";
import {
  type FailCallback,
  type SuccessCallback,
} from "../lib/typings/runtime-validate.ts";
import {defineComponent, getCurrentInstance, h, onMounted, ref} from "vue";
import {type depConditionMap, DepValues} from "../lib/typings/runtime-dependency.ts";
import type {DataEffect} from "../lib/typings/runtime-data-effect.ts";


const scopeConfig = {
  'scope1': {
    testChildren: {
      title: 'Test Children',
      display: true,
      required: {
        value: true,
        message: 'test children',
        // immediate: false
      },
      valueType: String,
      defaultValue: '2',
      component: {
        body: () => import('./MySelect.vue'),
        children: [
          {
            body: () => import('./MySelectOptions.vue'),
            bind: {
              options: [
                {label: 'hello', value: '1'},
                {label: 'world', value: '2'},
                {label: 'fuck you', value: '3'},
              ]
            }
          }
        ]
      },
      dependencies: [
        {
          depField: 'name',
          depValues: ['hello'],
          depCondition: 'some',
          reset: {
            display: false
          }
        }
      ]
    },
    name: {
      title: 'Name',
      display: true,
      required: {
        value: true,
        message: 'Please input name,Please input namePlease input name,Please input name,Please input name'
      },
      component: {
        body: () => import('../lib/component/G3Input.vue'),
        bind: {
          placeholder: 'Please input name',
          type: 'text',
          disable: false
        },
      },
      order: 1,
      valueType: String,
      validator: async (value: string, success: SuccessCallback, fail: FailCallback) => {
        if (value.length > 100) {
          fail('The username length should not exceed 10.')
          return
        }

        await new Promise((resolve) => {
          console.log('发起请求')
          setTimeout(() => {
            resolve(1)
          }, 1000)
        })
        if (value.includes('fu')) {
          fail('don\'t fu')
        } else {
          success(true)
        }
      },
      dependencies: [
        {
          depField: 'testChildren',
          depValues: ['1'],
          depCondition: 'some',
          reset: {
            display: false,
            required: false,
            defaultValue: 'for test children'
          }
        }
      ]
    },
    age: {
      title: 'Role Age',
      display: true,
      required: {
        value: true,
        message: "Please input role age."
      },
      component: {
        body: () => import('../lib/component/G3Input.vue'),
        bind: {
          type: 'number',
          placeholder: 'age',
        }
      },
      valueType: Number
    },
    password: {
      title: 'Test2',
      display: true,
      required: {
        value: true,
        message: 'Please input test2',
        // immediate: false
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
      validator: (value: any, success: SuccessCallback, fail: FailCallback) => {
        if (/^[0-9]+$/.test(value)) {
          fail('失败')
        } else {
          success()
        }
      },
      dependencies: [
        {
          depField: 'name',
          depValues: [
            'sbs1',
          ],
          // depCondition: 'some',
          depCondition: (value: any, values: string[]) => {
            console.log('value=', value)
            if (!value.trim()) {
              return false
            }
            for (const v of values) {
              if (v.includes(value)) {
                return true
              }
            }
            return false
          },
          priority: 1,
          reset: {
            display: true,
            required: {
              value: false,
              message: 'Please input test2',
            },
            component: {
              body: defineComponent({
                render() {
                  return h('div', 'Sync Component')
                }
              })
            },
            valueType: String,
            defaultValue: '123'
          }
        },
        {
          depField: 'name',
          depValues: [
            'ssss',
          ],
          depCondition: 'some',
          priority: 1,
          reset: {
            required: {
              value: false,
              message: 'Please input test2',
            },
            component: {
              body: defineComponent({
                render() {
                  return h('div', 'Sync Component2')
                }
              })
            }
          }
        }
      ]
    },
    // test3: {
    //   title: 'Test3',
    //   display: true,
    //   required: {
    //     value: true,
    //     message: 'Please input test3'
    //   },
    //   component: () => import('../lib/component/G3Input.vue'),
    //   order: 2,
    //   valueType: 'STRING',
    //   componentProps: {
    //     placeholder: 'your password',
    //     type: 'password',
    //     disable: false
    //   },
    // },
    // test4: {
    //   title: 'Test4',
    //   display: true,
    //   required: {
    //     value: true,
    //     message: 'Please input test4'
    //   },
    //   component: () => import('../lib/component/G3Input.vue'),
    //   order: 2,
    //   valueType: 'STRING',
    //   componentProps: {
    //     placeholder: 'your password',
    //     type: 'password',
    //     disable: false
    //   },
    //   gender: {
    //     title: 'Gender',
    //     display: true,
    //     required: {
    //       value: true,
    //       message: 'Gender cannot be empty.'
    //     },
    //     // 引用第三方组件，也可进行手动封装
    //     component: {
    //       content: () => import('../src/MySelect.vue'),
    //       componentProps: {
    //         placeholder: 'Please select your gender',
    //       },
    //       children: {
    //         content: () => import('../src/MySelectOptions.vue'),
    //         componentProps: {
    //           placeholder: 'Please select your gender',
    //         },
    //       }
    //     },
    //     order: 3,
    //     valueType: 'number',
    //     options: [
    //       {label: 'Male', value: 1},
    //       {label: 'Female', value: 0}
    //     ]
    //   }
    // }
  }
}

const testKeyDataEffect: DataEffect = {
  testChildren: [
    {
      slaveField: 'name',
      slaveValueMap: new Map<any, any>([
        ['1', 'Jack'],
        ['3', 'Helen'],
      ])
    }
  ]
}

const {proxy} = getCurrentInstance()
const testValue = ref({password: '123', age: null})

function init() {
  Promise.resolve().then(() => {
    setTimeout(() => {
      Object.assign(testValue.value, {name: '', age: null})
      console.log('ssss')
    }, 3000)
  })
}

init()

onMounted(() => {
  // init()
})

async function submit() {
  const data = await proxy.$refs.configForm.submit()
  console.log('data=', data)
}
</script>

<template>
  <div style="max-width: 600px">
    <G3ConfigForm :key-config="scopeConfig.scope1"
                  :key-data="testValue"
                  :key-data-effect="testKeyDataEffect"
                  ref="configForm"
                  :immediate="false">
      <template #_FOOTER>
        <button @click="submit">submit</button>
      </template>
    </G3ConfigForm>
  </div>
</template>

<style scoped>
:deep(.g3-config-form-items) {
  display: grid;
  grid-template-columns: 1fr;
}
</style>
