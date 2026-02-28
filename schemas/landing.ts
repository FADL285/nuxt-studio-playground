import { z } from '@nuxt/content'
import { createBaseSchema, createEnum, createFeatureSchema, createLinkSchema } from './shared'

export const landingPageSchema = z.object({
  hero: z.object({
    links: z.array(createLinkSchema())
  }),
  section: createBaseSchema().extend({
    headline: z.string().optional(),
    images: z.object({
      mobile: z.string().optional(),
      desktop: z.string().optional()
    }),
    features: z.array(
      createBaseSchema().extend({
        icon: z.string().editor({ input: 'icon' })
      })
    )
  }),
  features: createBaseSchema().extend({
    features: z.array(createFeatureSchema())
  }),
  steps: createBaseSchema().extend({
    items: z.array(createFeatureSchema().extend({
      image: z.object({
        light: z.string().editor({ input: 'media' }),
        dark: z.string().editor({ input: 'media' })
      }).optional()
    }))
  }),
  pricing: createBaseSchema().extend({
    plans: z.array(
      createBaseSchema().extend({
        price: z.string().nonempty(),
        button: createLinkSchema(),
        features: z.array(z.string().nonempty()),
        highlight: z.boolean().optional(),
        billing_period: z.string().nonempty(),
        billing_cycle: z.string().nonempty()
      })
    )
  }),
  testimonials: createBaseSchema().extend({
    items: z.array(
      z.object({
        quote: z.string().nonempty(),
        user: z.object({
          name: z.string().nonempty(),
          description: z.string().nonempty(),
          to: z.string().nonempty(),
          avatar: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string().optional()
          }),
          target: createEnum(['_blank', '_self'])
        })
      }))
  }),
  cta: createBaseSchema().extend({
    links: z.array(createLinkSchema())
  })
})
