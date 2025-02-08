<script setup lang="ts">
import G3ConfigForm from "../lib/G3ConfigForm.vue";
import {
  type FailCallback,
  type SuccessCallback,
  TriggerType,
  type ValidateResult
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
            // response.success = false
            // response.message = 'The username length should not exceed 10.'
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
            // response.success = false
            // response.message = 'fuck'
          } else {
            success(true)
            // response.success = false
            // response.message = value
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
    <G3ConfigForm :key-config="scopeConfig.scope1">
      <template #footer>
        <button>submit a</button>
      </template>
    </G3ConfigForm>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
