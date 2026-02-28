<script setup lang="ts">
const props = defineProps<{
  title: string
  items: Array<{
    question: string
    answer: string
  }>
}>()

const accordionItems = computed(() =>
  props.items.map(item => ({
    label: item.question,
    content: item.answer
  }))
)
</script>

<template>
  <UPageSection>
    <template #title>
      <MDC
        :value="title"
        unwrap="p"
      />
    </template>

    <UContainer class="max-w-3xl">
      <UAccordion :items="accordionItems" />
    </UContainer>
  </UPageSection>
</template>
