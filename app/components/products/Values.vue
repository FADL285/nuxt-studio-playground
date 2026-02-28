<script setup lang="ts">
defineProps<{
  title: string
  items: Array<{
    title: string
    description: string
    icon: string
  }>
}>()
</script>

<template>
  <UPageSection :features="items">
    <template #title>
      <MDC :value="title" unwrap="p" />
    </template>
  </UPageSection>
</template>
