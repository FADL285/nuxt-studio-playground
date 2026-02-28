<script setup lang="ts">
defineProps<{
  title: string
  description: string
  image?: string
}>()
</script>

<template>
  <UPageHero
    :description="description"
    :ui="{ container: 'md:pt-18 lg:pt-20', title: 'max-w-3xl mx-auto' }"
  >
    <template #title>
      <MDC
        :value="title"
        unwrap="p"
      />
    </template>
  </UPageHero>
</template>
