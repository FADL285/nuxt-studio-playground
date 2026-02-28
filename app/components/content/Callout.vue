<script setup lang="ts">
/**
 * MDC block component with optional title slot and default body.
 * Use in .md/.mdc as:
 *   ::callout
 *   #title
 *   Optional title
 *   #default
 *   Body **markdown** here.
 *   ::
 */
defineProps<{
  type?: 'info' | 'warning' | 'tip'
}>()
</script>

<template>
  <div
    class="callout rounded-lg border p-4 my-4"
    :class="{
      'border-primary-500 bg-primary-500/10': type === 'info' || !type,
      'border-amber-500 bg-amber-500/10': type === 'warning',
      'border-emerald-500 bg-emerald-500/10': type === 'tip'
    }"
  >
    <h3
      v-if="$slots.title"
      class="font-semibold mb-2 text-sm uppercase tracking-wide opacity-90"
    >
      <MDCSlot
        :use="$slots.title"
        unwrap="p"
      />
    </h3>
    <div class="prose prose-sm max-w-none dark:prose-invert">
      <MDCSlot
        :use="$slots.default"
        unwrap="p"
      />
    </div>
  </div>
</template>
