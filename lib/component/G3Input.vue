<script setup lang="ts">

import {getNormalProps} from "./props.ts";

const inputValue = defineModel()
const props = defineProps(Object.assign(getNormalProps(), {
  type: {
    type: String,
    required: false,
    default: 'text' // 支持text/password/number/color
  }
}))
</script>

<template>
  <div class="g3-input-wrapper">
    <input v-model="inputValue" :placeholder="props.placeholder" :disabled="props.disable" :type="props.type"/>
  </div>
</template>

<style scoped>

input {
  width: 100%;
  min-height: 40px;
  border-radius: 10px;
  background-color: var(--g3-color-background-main);
  border: 1px solid var(--g3-color-line-weak);
  color: var(--g3-color-font-weak);
  padding: 5px 10px;
}

input:focus, input:active, input:focus-visible {
  border: 1px solid var(--g3-color-line-light);
  outline: none;
}

input::placeholder {
  color: var(--g3-color-background-fifth);
}

input:disabled {
  cursor: not-allowed;
  background-color: var(--g3-color-background-seventh);
}

/* 移除 Chrome 和 Safari 中的上下箭头 */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 移除 Firefox 中的上下箭头 */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
