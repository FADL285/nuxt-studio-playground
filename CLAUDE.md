# Nuxt Hybrid Sandbox

POC for integrating Nuxt Studio (self-hosted), Nuxt Content v3, and Nuxt i18n with bilingual RTL/LTR support. Blueprint for a Magento-based e-commerce project.

## Tech Stack

- **Framework**: Nuxt 4 (SSR)
- **Content**: @nuxt/content v3 (document-driven, locale-based collections)
- **CMS**: nuxt-studio (self-hosted, accessible at `/_studio`)
- **i18n**: @nuxtjs/i18n (`prefix_except_default`, default: `ar`)
- **UI**: @nuxt/ui v4, Tailwind CSS v4
- **Language**: TypeScript, Composition API
- **Package Manager**: pnpm

## Locales

| Code | Language | Direction | URL Prefix |
|------|----------|-----------|------------|
| `ar` | العربية | RTL | `/ar/` |
| `en` | English | LTR | `/en/` |

## Content Structure

```
content/
  ar/          # Arabic content (default locale)
    index.yml  # Landing page data
    *.md       # Markdown pages with MDC components
  en/          # English content
    index.yml
    *.md
```

Collections defined in `content.config.ts`:
- `content_ar` / `content_en` — YAML-driven pages (landing)
- `pages_ar` / `pages_en` — Markdown pages (showcase, etc.)

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # ESLint
pnpm typecheck    # Type checking
```

## Conventions

- Composition API with `<script setup lang="ts">`
- Conventional Commits (`feat|fix|refactor|...`)
- Components in `app/components/content/` are MDC-usable and Studio-editable
- UI translations in `i18n/locales/{locale}.json`
- Content translations in `content/{locale}/`
