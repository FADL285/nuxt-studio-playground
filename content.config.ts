import { defineCollection } from '@nuxt/content'
import { landingPageSchema } from './schemas/landing'
import { productsPageSchema } from './schemas/products'

export const collections = {
  content_ar: defineCollection({
    type: 'page',
    source: {
      include: 'ar/**/*.yml',
      exclude: ['ar/products.yml'],
      prefix: '/ar'
    },
    schema: landingPageSchema
  }),
  content_en: defineCollection({
    type: 'page',
    source: {
      include: 'en/**/*.yml',
      exclude: ['en/products.yml'],
      prefix: '/en'
    },
    schema: landingPageSchema
  }),
  products_ar: defineCollection({
    type: 'data',
    source: { include: 'ar/products.yml' },
    schema: productsPageSchema
  }),
  products_en: defineCollection({
    type: 'data',
    source: { include: 'en/products.yml' },
    schema: productsPageSchema
  }),
  pages_ar: defineCollection({
    type: 'page',
    source: {
      include: 'ar/**/*.md',
      prefix: '/ar'
    }
  }),
  pages_en: defineCollection({
    type: 'page',
    source: {
      include: 'en/**/*.md',
      prefix: '/en'
    }
  })
}
