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
        value: true,
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
      display: true,
      required: {
        value: true,
        message: 'Please input test2'
      },
      component: () => import('../lib/component/G3Input.vue'),
      order: 2,
      valueType: 'STRING',
      componentProps: {
        placeholder: 'your password',
        type: 'password',
        disable: false
      },
    },
    test3: {
      title: 'Test3',
      display: true,
      required: {
        value: true,
        message: 'Please input test3'
      },
      component: () => import('../lib/component/G3Input.vue'),
      order: 2,
      valueType: 'STRING',
      componentProps: {
        placeholder: 'your password',
        type: 'password',
        disable: false
      },
    },
    test4: {
      title: 'Test4',
      display: true,
      required: {
        value: true,
        message: 'Please input test4'
      },
      component: () => import('../lib/component/G3Input.vue'),
      order: 2,
      valueType: 'STRING',
      componentProps: {
        placeholder: 'your password',
        type: 'password',
        disable: false
      },
    }
  }
}
</script>

<template>
  <div>
    <G3ConfigForm :key-config="scopeConfig.scope1"></G3ConfigForm>
  </div>
</template>

<style scoped>
:deep(.g3-config-form-items) {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
