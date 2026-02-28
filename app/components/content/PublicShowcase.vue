<script setup lang="ts">
import type { ProductsResponse } from '~/types/product'

// MDC/Studio pass props as strings (e.g. limit="4"); coerce to number
const props = withDefaults(defineProps<{
  category?: string
  limit?: number | string
}>(), {
  category: '',
  limit: 4
})

const limitNum = computed(() => {
  const v = props.limit
  if (typeof v === 'number') return v
  const n = Number(v)
  return Number.isNaN(n) ? 4 : n
})

const url = computed(() => {
  const base = 'https://dummyjson.com/products'
  const params = new URLSearchParams({ limit: String(limitNum.value) })
  if (props.category) params.set('category', props.category)
  return `${base}${props.category ? `/category/${props.category}` : ''}?${params}`
})

const { data: productsData, status } = await useFetch<ProductsResponse>(url, {
  key: `products-${props.category}-${limitNum.value}`
})

const products = computed(() => productsData.value?.products ?? [])
</script>

<template>
  <div class="my-8">
    <div
      v-if="status === 'pending'"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="animate-spin size-8 text-primary"
      />
    </div>

    <div
      v-else-if="status === 'error'"
      class="text-center py-12 text-red-500"
    >
      Failed to load products
    </div>

    <div
      v-else-if="products.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="rounded-lg border border-default bg-default p-4 flex flex-col items-center gap-3"
      >
        <img
          :src="product.thumbnail"
          :alt="product.title"
          class="size-24 object-contain"
        >
        <h3 class="text-sm font-medium line-clamp-2 text-center">
          {{ product.title }}
        </h3>
        <span class="text-primary font-bold">${{ product.price }}</span>
      </div>
    </div>
  </div>
</template>
