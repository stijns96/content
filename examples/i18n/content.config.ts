import { defineCollection, z } from '@nuxt/content'

const commonSchema = z.object({})

export const collections = {
  content_en: defineCollection({
    type: 'page',
    source: {
      include: 'en/**',
      prefix: '',
    },
    schema: commonSchema,
  }),
  content_fr: defineCollection({
    type: 'page',
    source: {
      include: 'fr/**',
      prefix: '',
    },
    schema: commonSchema,
  }),
  content_fa: defineCollection({
    type: 'page',
    source: {
      include: 'fa/**',
      prefix: '',
    },
    schema: commonSchema,
  }),
}