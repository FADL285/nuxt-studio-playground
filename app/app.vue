<script setup lang="ts">
const { locale } = useI18n()
const head = useLocaleHead({
  dir: true,
  seo: true
})
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#171717' : 'white')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    ...(head.value.link || [])
  ],
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang || locale.value,
    dir: (head.value.htmlAttrs?.dir || (locale.value === 'ar' ? 'rtl' : 'ltr')) as 'rtl' | 'ltr'
  }
})

useSeoMeta({
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/landing-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/landing-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <AppHeader />

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
