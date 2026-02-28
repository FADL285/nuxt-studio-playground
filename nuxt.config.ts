/// <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/i18n',
    'nuxt-studio'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  routeRules: {
    '/ar': { swr: 7200 },
    '/en': { swr: 7200 },
    '/ar/products': { swr: 7200 },
    '/en/products': { swr: 7200 },
    '/ar/privacy-policy': { prerender: true },
    '/en/privacy-policy': { prerender: true },
    '/ar/return-policy': { prerender: true },
    '/en/return-policy': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      routes: ['/ar/', '/en/']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      {
        code: 'ar',
        language: 'ar-SA',
        dir: 'rtl',
        name: 'العربية',
        file: 'ar.json'
      },
      {
        code: 'en',
        language: 'en-US',
        dir: 'ltr',
        name: 'English',
        file: 'en.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
    baseUrl: 'http://localhost:3000',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  studio: {
    repository: {
      provider: 'github',
      // * When deploying on Vercel, Netlify, GitHub Actions, or GitLab CI, Studio automatically detects the repository provider, owner, repo, and branch from the platform's environment variables.
      // owner: 'FADL285',
      // repo: 'nuxt-studio-demo',
      branch: process.env.STUDIO_BRANCH_NAME || 'main' // Optional, defaults to 'main'
    }
  }
})
