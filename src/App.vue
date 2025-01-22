<script setup lang="ts">
import {scopeConfig} from "@/moke-config.ts";
import G3ConfigForm from "../lib/G3ConfigForm.vue";
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
