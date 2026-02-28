# Nuxt Hybrid Sandbox — Experiment Roadmap

Step-by-step guide from setup to a working bilingual hybrid page with Nuxt Studio editing.

---

## Phase 1: Infrastructure & i18n ✅

- [x] Install dependencies: `pnpm add @nuxtjs/i18n nuxt-studio`
- [x] Create `i18n/locales/ar.json` and `i18n/locales/en.json`
- [x] Update `nuxt.config.ts` with i18n + studio config
- [x] Update `content.config.ts` with locale-based collections
- [x] Migrate content: `content/ar/index.yml` + `content/en/index.yml`

## Phase 2: PublicShowcase Bridge Component ✅

- [x] Create `app/components/content/PublicShowcase.vue` (MDC-usable)
- [x] SSR-compatible via `useFetch` with loading/error states

## Phase 3: Hybrid Pages & RTL ✅

- [x] Dynamic `lang`/`dir` via `useLocaleHead()`
- [x] Locale-aware content queries
- [x] Locale switcher in header
- [x] `[...slug].vue` catch-all for markdown

## Phase 4: Hybrid Page Architecture ✅

- [x] Three page types: Hybrid, Editorial, Standalone
- [x] Products hybrid page: YAML (Studio) + API data in parallel
- [x] Editorial markdown pages: privacy-policy, return-policy
- [x] Schema extraction into `schemas/` directory
- [x] SWR caching via `routeRules`
- [x] DummyJSON API integration (replaced FakeStoreAPI)

## Phase 5: Auth & Studio Workflow (Research)

- [ ] Document auth options for content team access
- [ ] **Verify**: `/_studio` opens editor, content files visible

---

# Hybrid Page Architecture — Tutorial & Reference

> Blueprint for Oriental Weavers: three page types, one unified Nuxt codebase.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Page Type 1: Hybrid Pages](#page-type-1-hybrid-pages)
3. [Page Type 2: Editorial Pages](#page-type-2-editorial-pages)
4. [Page Type 3: Standalone Pages](#page-type-3-standalone-pages)
5. [Content Config & Collections](#content-config--collections)
6. [SWR Caching Strategy](#swr-caching-strategy)
7. [Oriental Weavers Mapping](#oriental-weavers-mapping)
8. [Checklist for New Pages](#checklist-for-new-pages)

---

## Architecture Overview

Every page in the app falls into one of three types:

| Type | Data Source | Studio Editing | Example Routes |
|------|-----------|----------------|----------------|
| **Hybrid** | YAML (Studio) + API (Magento/external) | Form editor for YAML sections | `/products`, `/` (home) |
| **Editorial** | Markdown files | TipTap WYSIWYG editor | `/privacy-policy`, `/return-policy` |
| **Standalone** | None (pure Vue SFC) | Not editable | `/contact`, `/store-locator` |

### Key Insight

The Vue SFC **owns the layout**. It decides which sections exist and their order. YAML provides the **editable marketing content** (headlines, feature cards, FAQs). The API provides the **dynamic data** (products, categories, prices).

```
┌─────────────────────────────────────────────┐
│  products.vue (Vue SFC — owns layout)       │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Hero Section      ← YAML (Studio)  │    │
│  ├─────────────────────────────────────┤    │
│  │ Product Grid      ← API (Magento)  │    │
│  ├─────────────────────────────────────┤    │
│  │ Value Props       ← YAML (Studio)  │    │
│  ├─────────────────────────────────────┤    │
│  │ FAQ               ← YAML (Studio)  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## Page Type 1: Hybrid Pages

### Step-by-step: Creating a hybrid page

#### 1. Define the schema (`schemas/<name>.ts`)

Schemas live in `schemas/` at the project root. They define the shape of your YAML content and power Studio's form editor.

```ts
// schemas/products.ts
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
```

**Studio editor hints:**
- `.editor({ input: 'media' })` → image picker
- `.editor({ input: 'icon' })` → icon picker
- `.editor({ hidden: true })` → hidden from Studio UI
- Use `createBaseSchema()` from `schemas/shared.ts` to reuse `{ title, description }` pairs

#### 2. Register the collection (`content.config.ts`)

```ts
import { productsPageSchema } from './schemas/products'

// Use type: 'data' for hybrid pages (not 'page')
// 'data' = queryable but not auto-routed
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
```

**`type: 'data'` vs `type: 'page'`:**
- `page` = content drives the route (auto-generates `.path`, consumed by `[...slug].vue`)
- `data` = queryable data consumed by a specific Vue SFC
- Hybrid pages are Vue SFCs that *consume* YAML data — they're not content-driven routes

#### 3. Create YAML content (`content/{locale}/<name>.yml`)

```yaml
# content/ar/products.yml
title: منتجاتنا
description: اكتشف مجموعتنا المتميزة
hero:
  title: اكتشف **أفضل المنتجات**
  description: مجموعة مختارة بعناية
value_propositions:
  title: لماذا تتسوق معنا؟
  items:
    - title: شحن سريع
      description: توصيل خلال 24 ساعة
      icon: i-lucide-truck
faq:
  title: الأسئلة الشائعة
  items:
    - question: كيف أتتبع طلبي؟
      answer: ستصلك رسالة بالبريد الإلكتروني...
```

**Tip:** Use `**bold**` in titles — the `<MDC>` component renders it as rich text.

#### 4. Create page components (`app/components/<name>/`)

Nuxt auto-imports components with directory prefix:

```
app/components/products/
  Hero.vue    → <ProductsHero>
  Grid.vue    → <ProductsGrid>
  Values.vue  → <ProductsValues>
  Faq.vue     → <ProductsFaq>
```

**Naming rule:** The directory name becomes the auto-import prefix. `products/Hero.vue` → `<ProductsHero>`. Don't double-prefix (e.g., `products/ProductsHero.vue` → `<ProductsProductsHero>` — broken!).

Each component receives props from the parent page:

```vue
<!-- app/components/products/Hero.vue -->
<script setup lang="ts">
defineProps<{
  title: string
  description: string
  image?: string
}>()
</script>

<template>
  <UPageHero :description="description">
    <template #title>
      <MDC :value="title" unwrap="p" />
    </template>
  </UPageHero>
</template>
```

#### 5. Create the page SFC (`app/pages/<name>.vue`)

This is the orchestrator — fetches both YAML and API data in parallel:

```vue
<script setup lang="ts">
import type { Collections } from '#build/content'
import type { Product, ProductsResponse } from '~/types/product'

const { locale } = useI18n()

// Map locale to collection name
const collectionMap: Record<string, keyof Collections> = {
  ar: 'products_ar',
  en: 'products_en'
}
const collectionName = computed(() => collectionMap[locale.value] || 'products_ar')

// Parallel fetch: Studio YAML + external API
const [{ data: page }, { data: products, status: productsStatus }] = await Promise.all([
  useAsyncData(`products-content-${locale.value}`, () =>
    queryCollection(collectionName.value).first()
  ),
  useFetch<ProductsResponse>('https://dummyjson.com/products?limit=8', {
    key: `products-api-${locale.value}`,
    transform: (data: ProductsResponse): Product[] => data.products
  })
])

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.seo?.title || page.value.title,
  description: page.value.seo?.description || page.value.description
})
</script>

<template>
  <div v-if="page">
    <ProductsHero :title="page.hero.title" :description="page.hero.description" />
    <ProductsGrid :products="products" :status="productsStatus" />
    <ProductsValues :title="page.value_propositions.title" :items="page.value_propositions.items" />
    <ProductsFaq :title="page.faq.title" :items="page.faq.items" />
  </div>
</template>
```

**Critical patterns:**
- `Promise.all` parallelizes YAML + API fetches (both run during SSR)
- `useAsyncData` for Content queries, `useFetch` for external APIs
- Include `locale.value` in fetch keys to avoid cross-locale caching
- `queryCollection(...).first()` works for `type: 'data'` (no `.path()` needed)

---

## Page Type 2: Editorial Pages

Markdown pages managed entirely through Studio's TipTap WYSIWYG editor.

### How it works

1. Create `content/{locale}/privacy-policy.md` with YAML frontmatter
2. The existing `[...slug].vue` catch-all renders it via `ContentRenderer`
3. In Studio, editors see a full rich-text editor (TipTap)

```markdown
---
title: سياسة الخصوصية
description: تعرف على كيفية حماية بياناتك الشخصية
---

# سياسة الخصوصية

Content here...
```

### Collection config

No changes needed — existing `pages_{locale}` collections handle all `*.md` files:

```ts
pages_ar: defineCollection({
  type: 'page',  // 'page' = auto-routed, rendered by [...slug].vue
  source: {
    include: 'ar/**/*.md',
    prefix: '/ar'
  }
})
```

### Route priority

Named routes (`products.vue`) always beat catch-all (`[...slug].vue`). No guard logic needed.

---

## Page Type 3: Standalone Pages

Pure Vue SFCs with no content dependency.

```
app/pages/contact.vue       → /ar/contact, /en/contact
app/pages/store-locator.vue → /ar/store-locator, /en/store-locator
```

These use `useI18n()` for UI strings but don't query any content collection.

---

## Content Config & Collections

### File organization

```
schemas/
  shared.ts       # createEnum, createBaseSchema, createLinkSchema, createFeatureSchema
  landing.ts      # landingPageSchema
  products.ts     # productsPageSchema

content.config.ts  # imports schemas, defines collections (lean file)
```

### Collection scoping rules

When multiple `.yml` files exist in the same locale directory, use `exclude` to prevent schema conflicts:

```ts
// Landing pages — exclude products.yml to avoid schema validation failure
content_ar: defineCollection({
  type: 'page',
  source: {
    include: 'ar/**/*.yml',
    exclude: ['ar/products.yml'],
    prefix: '/ar'
  },
  schema: landingPageSchema
}),

// Products — exact file match
products_ar: defineCollection({
  type: 'data',
  source: { include: 'ar/products.yml' },
  schema: productsPageSchema
}),
```

**Rule:** Each file must match exactly ONE collection. Use `exclude` when glob patterns overlap.

---

## SWR Caching Strategy

```ts
// nuxt.config.ts
routeRules: {
  // Hybrid pages: SWR with 2-hour revalidation
  '/ar': { swr: 7200 },
  '/en': { swr: 7200 },
  '/ar/products': { swr: 7200 },
  '/en/products': { swr: 7200 },

  // Editorial pages: prerender at build time
  '/ar/privacy-policy': { prerender: true },
  '/en/privacy-policy': { prerender: true },
  '/ar/return-policy': { prerender: true },
  '/en/return-policy': { prerender: true }
}
```

| Strategy | When to use |
|----------|-------------|
| `swr: 7200` | Pages with API data that changes (products, home) |
| `prerender: true` | Static editorial content (policies, about) |
| *(none)* | SSR on every request (cart, checkout, account) |

---

## Oriental Weavers Mapping

### Home Page (`/`)

Current OW home has ~10 sections. Most from GraphQL API. Two ("Art of Weaving" + "Values") are hardcoded.

**Migration plan:**
1. Create `schemas/home.ts` with sections: `art_of_weaving`, `values`, `seo`
2. Create `content/{locale}/index.yml` with editable marketing copy
3. Keep `app/pages/index.vue` — it orchestrates:
   - Hero banner → Magento CMS block API
   - Category tiles → `useCategories()` composable
   - Featured products → `useProducts()` composable
   - **Art of Weaving** → YAML (Studio editable)
   - **Values** → YAML (Studio editable)
   - Newsletter → standalone component

### Products / Category Pages

```
ProductsHero      ← YAML: banner headline, CTA
ProductGrid       ← Magento: useProducts({ category })
FilterSidebar     ← Magento: useAggregations()
ValuePropositions ← YAML: why-buy-from-us cards
```

### About Us Page

Fully hybrid — most content from YAML, company stats from API.

### Policy Pages

Pure editorial markdown — `[...slug].vue` handles rendering.

---

## Checklist for New Pages

### Adding a new Hybrid Page

- [ ] Create schema in `schemas/<name>.ts`
- [ ] Import schema in `content.config.ts`
- [ ] Add `<name>_{locale}` collections with `type: 'data'`
- [ ] Update existing collection `exclude` if glob patterns overlap
- [ ] Create `content/{locale}/<name>.yml` for each locale
- [ ] Create page components in `app/components/<name>/`
- [ ] Create page SFC at `app/pages/<name>.vue`
- [ ] Add `routeRules` in `nuxt.config.ts` (SWR or prerender)
- [ ] Add nav link in `AppHeader.vue`
- [ ] Add i18n keys in `i18n/locales/{locale}.json`

### Adding a new Editorial Page

- [ ] Create `content/{locale}/<slug>.md` with frontmatter
- [ ] (Optional) Add `routeRules` for prerendering
- [ ] No code changes needed — `[...slug].vue` handles it

### Adding a new Standalone Page

- [ ] Create `app/pages/<name>.vue`
- [ ] Add i18n keys for UI strings
- [ ] Add nav link if needed

---

## File Map

```
content.config.ts                          # Collection definitions (lean)
schemas/
  shared.ts                                # Reusable schema helpers
  landing.ts                               # Landing page schema
  products.ts                              # Products page schema

content/
  ar/                                      # Arabic content (default locale)
    index.yml                              # Landing page data (hybrid)
    products.yml                           # Products page data (hybrid)
    privacy-policy.md                      # Privacy policy (editorial)
    return-policy.md                       # Return policy (editorial)
  en/                                      # English content (mirror structure)
    ...

app/
  types/
    product.ts                             # Shared Product interface
  pages/
    index.vue                              # Landing page (hybrid, type 1)
    products.vue                           # Products page (hybrid, type 1)
    [...slug].vue                          # Catch-all for editorial (type 2)
  components/
    products/                              # Products page components
      Hero.vue                             # → <ProductsHero>
      Grid.vue                             # → <ProductsGrid>
      Values.vue                           # → <ProductsValues>
      Faq.vue                              # → <ProductsFaq>
    content/                               # MDC components (Studio-usable in markdown)
      PublicShowcase.vue                   # Product showcase for markdown pages
    AppHeader.vue                          # Global nav with locale-aware links
    AppFooter.vue                          # Global footer

i18n/locales/
  ar.json                                  # Arabic UI strings
  en.json                                  # English UI strings

nuxt.config.ts                             # Route rules, modules, i18n config
```

---

## Auth Options (Research — Phase 5)

### Option 1: Studio Built-in OAuth
Best for dev teams. Configure in `.env`:
```
NUXT_OAUTH_GITHUB_CLIENT_ID=xxx
NUXT_OAUTH_GITHUB_CLIENT_SECRET=xxx
```
Content editors need GitHub/GitLab accounts. Changes commit to the repo.

### Option 2: Custom Auth (Magento Integration)
For content teams without Git access:
- Server route validates credentials against Magento REST API
- Issues session cookie that gates `/_studio` access
- Requires `nuxt-auth-utils` module

### Option 3: SSO Bridge
Seamless auth if users are already logged into Magento:
- Shared domain cookie or token exchange
- Most complex but best UX for content teams

> **Decision needed**: Which auth path fits the e-commerce project? To discuss.
