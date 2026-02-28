<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const nuxtApp = useNuxtApp()
const { activeHeadings, updateHeadings } = useScrollspy()

const route = useRoute()
const isHomePage = computed(() => route.path === localePath('/'))

const homeItems = computed(() => [{
  label: t('nav.features'),
  to: '#features',
  active: activeHeadings.value.includes('features') && !activeHeadings.value.includes('pricing')
}, {
  label: t('nav.pricing'),
  to: '#pricing',
  active: activeHeadings.value.includes('pricing')
}, {
  label: t('nav.testimonials'),
  to: '#testimonials',
  active: activeHeadings.value.includes('testimonials') && !activeHeadings.value.includes('pricing')
}])

const siteItems = computed(() => [{
  label: t('nav.products'),
  to: localePath('/products')
}])

const items = computed(() => isHomePage.value
  ? [...homeItems.value, ...siteItems.value]
  : siteItems.value
)

const otherLocale = computed(() => {
  return locales.value.find((l) => {
    const code = typeof l === 'string' ? l : l.code
    return code !== locale.value
  })
})

const otherLocaleCode = computed(() => {
  if (!otherLocale.value) return ''
  return typeof otherLocale.value === 'string' ? otherLocale.value : otherLocale.value.code
})

const otherLocaleName = computed(() => {
  if (!otherLocale.value) return ''
  return typeof otherLocale.value === 'string' ? otherLocale.value : otherLocale.value.name || otherLocale.value.code
})

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    document.querySelector('#features'),
    document.querySelector('#pricing'),
    document.querySelector('#testimonials')
  ].filter(Boolean) as Element[])
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink :to="localePath('/')">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:block"
      />

      <UButton
        :label="t('common.downloadApp')"
        variant="subtle"
        class="hidden lg:block"
      />

      <UButton
        v-if="otherLocale && (otherLocaleCode === 'ar' || otherLocaleCode === 'en')"
        :label="otherLocaleName"
        :to="switchLocalePath(otherLocaleCode as 'ar' | 'en')"
        variant="ghost"
        color="neutral"
        size="sm"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
      <UButton
        class="mt-4"
        :label="t('common.downloadApp')"
        variant="subtle"
        block
      />
    </template>
  </UHeader>
</template>
