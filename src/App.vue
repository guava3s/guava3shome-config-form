<script setup lang="ts">
import G3ConfigForm from "../lib/G3ConfigForm.vue";
import {TriggerType, type ValidateResult} from "../lib/typings/runtime-validate.ts";

const scopeConfig = {
  'scope1': {
    name: {
      title: 'Test1',
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
        triggerDelay: 200,
        validate: async (value: string, response: ValidateResult) => {
          if (value.length > 32) {
            response.success = false
            response.message = 'The username length should not exceed 32.'
            return
          }

          new Promise((resolve) => {
            console.log('发起请求')
            setTimeout(() => {
              if (value.includes('fu')) {
                response.success = false
                response.message = 'fuck'
                resolve(response)
              } else {
                response.success = false
                response.message = value
                console.log('promise to set timeout value=', value)
                resolve(response)
              }
            }, 1000)
          })
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
            required: false
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
