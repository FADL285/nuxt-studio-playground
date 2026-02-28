import { z } from '@nuxt/content'
import { createBaseSchema } from './shared'

export const productsPageSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional()
  }).optional(),
  hero: z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
    image: z.string().optional().editor({ input: 'media' })
  }),
  value_propositions: z.object({
    title: z.string().nonempty(),
    items: z.array(createBaseSchema().extend({
      icon: z.string().editor({ input: 'icon' })
    }))
  }),
  faq: z.object({
    title: z.string().nonempty(),
    items: z.array(z.object({
      question: z.string().nonempty(),
      answer: z.string().nonempty()
    }))
  })
})
