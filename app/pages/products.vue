<script setup lang="ts">
import type { ProductsArCollectionItem, ProductsEnCollectionItem, Collections } from '@nuxt/content'
import type { ProductsResponse } from '~/types/product'

const { locale } = useI18n()

const collectionMap: Record<string, keyof Collections> = {
  ar: 'products_ar',
  en: 'products_en'
}

const collectionName = computed(() => collectionMap[locale.value as 'ar' | 'en'] ?? 'products_ar')

// Fetch Studio YAML + API products in parallel
const [{ data: page }, { data: productsData, status: productsStatus }] = await Promise.all([
  useAsyncData(`products-content-${locale.value}`, () =>
    queryCollection(collectionName.value as keyof Collections).first()
  ),
  useFetch<ProductsResponse>('https://dummyjson.com/products?limit=8', {
    key: `products-api-${locale.value}`
  })
])

const products = computed(() => productsData.value?.products ?? null)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const pageData = page.value as ProductsArCollectionItem | ProductsEnCollectionItem

useSeoMeta({
  title: pageData.seo?.title || pageData.title,
  ogTitle: pageData.seo?.title || pageData.title,
  description: pageData.seo?.description || pageData.description,
  ogDescription: pageData.seo?.description || pageData.description
})
</script>

<template>
  <div v-if="pageData">
    <ProductsHero
      :title="pageData.hero.title"
      :description="pageData.hero.description"
      :image="pageData.hero.image"
    />

    <ProductsGrid
      :products="products"
      :status="productsStatus"
    />

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <ProductsValues
      :title="pageData.value_propositions.title"
      :items="pageData.value_propositions.items"
    />

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <ProductsFaq
      :title="pageData.faq.title"
      :items="pageData.faq.items"
    />
  </div>
</template>
