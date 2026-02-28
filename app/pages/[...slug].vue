<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const { locale } = useI18n()
const route = useRoute()

const collectionMap: Record<string, keyof Collections> = {
  ar: 'pages_ar',
  en: 'pages_en'
}

const collectionName = computed(() => collectionMap[locale.value as 'ar' | 'en'] ?? 'pages_ar')

const { data: page } = await useAsyncData(`page-${route.path}`, () =>
  queryCollection(collectionName.value as keyof Collections).path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})
</script>

<template>
  <UContainer
    v-if="page"
    class="py-12"
  >
    <ContentRenderer :value="page" />
  </UContainer>
</template>
