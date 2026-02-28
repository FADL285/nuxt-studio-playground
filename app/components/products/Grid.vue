<script setup lang="ts">
import type { Product } from '~/types/product'
import type { AsyncDataRequestStatus } from '#app'

defineProps<{
  products: Product[] | null
  status: AsyncDataRequestStatus
}>()
</script>

<template>
  <UPageSection>
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
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-alert-triangle"
        class="size-8 text-error mb-2"
      />
      <p class="text-muted">
        Failed to load products
      </p>
    </div>

    <div
      v-else-if="products?.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <UPageCard
        v-for="product in products"
        :key="product.id"
        :title="product.title"
        :description="`$${product.price}`"
        :ui="{ container: 'p-4 sm:p-4', title: 'line-clamp-2 text-sm', description: 'text-primary font-bold text-lg' }"
      >
        <img
          :src="product.thumbnail"
          :alt="product.title"
          class="size-32 object-contain mx-auto"
        >
      </UPageCard>
    </div>
  </UPageSection>
</template>
