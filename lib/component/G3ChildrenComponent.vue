<script setup lang="ts">

import type {MetaConfigComponent, MetaKeyComponentProps, PromiseComponent} from "../typings/meta-config.ts";
import type {Component} from "@vue/runtime-core";
import {hasFunction} from "../util/type-check.ts";
import {computed, defineAsyncComponent, type PropType} from "vue";

type BodyType = Component | (() => Promise<Component>)

const props = defineProps({
  body: {
    type: [Object, Function] as PropType<BodyType>, // 统一类型声明
    required: true
  },
  bind: {
    type: Object as () => MetaKeyComponentProps,
    required: false,
    default: () => {
    }
  },
  children: {
    type: Array as () => MetaConfigComponent[],
    required: false,
    default: () => []
  }
})

const renderBody = computed(() => {
  return hasFunction(props.body) ? defineAsyncComponent(props.body as PromiseComponent) : props.body
})
</script>

<template>
  <component :is="renderBody" v-bind="bind">
    <template #default>
      <G3ChildrenComponent v-for="(item,i) in children" :key="i"
                           :body="item.body"
                           :bind="item.bind"
                           :children="item.children">
      </G3ChildrenComponent>
    </template>
  </component>
</template>

<style scoped>

</style>
