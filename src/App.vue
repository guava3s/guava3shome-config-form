<script setup lang="ts">
import G3ConfigForm from "../lib/G3ConfigForm.vue";
import {
  type FailCallback,
  type SuccessCallback,
} from "../lib/typings/runtime-validate.ts";
import {defineComponent, getCurrentInstance, h, onMounted, ref} from "vue";


const scopeConfig = {
  'scope1': {
    hello: {
      fixed: true,
      valueType: Boolean,
      defaultValue: 1434
    },
    name: {
      title: 'Test1',
      display: true,
      required: {
        value: true,
        message: 'Please input name,Please input namePlease input name,Please input name,Please input name,Please input namePlease input name,Please input name,Please input name,Please input name,Please input name,Please input name',
        // immediate: false
      },
      component: {
        body: () => import('../lib/component/G3Input.vue'),
        bind: {
          placeholder: 'Please input name',
          type: 'text',
          disable: false
        }
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
      dependencies: [
        {
          depField: 'name',
          depValues: [
            'sss',
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
                  return h('div', 'Sync Component')
                }
              })
            }
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

const {proxy} = getCurrentInstance()
const testValue = ref({})

async function submit() {
  const data = await proxy.$refs.configForm.submit()
  console.log('data=', data)
}
</script>

<template>
  <div style="max-width: 600px">
    <G3ConfigForm :key-config="scopeConfig.scope1"
                  :key-data="testValue"
                  ref="configForm" :immediate="false">
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
