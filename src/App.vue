<script setup lang="ts">
import G3ConfigForm from "../lib/G3ConfigForm.vue";
import {
  type FailCallback,
  type SuccessCallback,
  TriggerType,
} from "../lib/typings/runtime-validate.ts";

const scopeConfig = {
  'scope1': {
    name: {
      title: 'Test1',
      display: true,
      required: {
        value: false,
        message: 'Please input name name name',
        // immediate: false
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
        triggerDelay: 200,
        validate: async (value: string, success: SuccessCallback, fail: FailCallback) => {
          if (value.length > 100) {
            fail('The username length should not exceed 10.')
            return
          }

          await new Promise((resolve) => {
            console.log('发起请求')
            setTimeout(() => {
              resolve(1)
            }, 3000)
          })
          if (value.includes('fu')) {
            fail('don\'t fu')
          } else {
            success(true)
          }
        }
      },
    },
    password: {
      title: 'Test2',
      display: false,
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
            },
          }
        }
      ]
    }
  }
}
</script>

<template>
  <div>
    <G3ConfigForm :key-config="scopeConfig.scope1"></G3ConfigForm>
  </div>
</template>
