<script setup lang="ts">
import type { ContentArCollectionItem, ContentEnCollectionItem } from '@nuxt/content'
import type { Collections } from '@nuxt/content'

const { locale } = useI18n()

const collectionMap: Record<string, keyof Collections> = {
  ar: 'content_ar',
  en: 'content_en'
}

const collectionName = computed(() => collectionMap[locale.value as 'ar' | 'en'] ?? 'content_ar')

const { data: page } = await useAsyncData(`index-${locale.value}`, () =>
  queryCollection(collectionName.value as keyof Collections).path(`/${locale.value}`).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const pageData = page.value as ContentArCollectionItem | ContentEnCollectionItem

useSeoMeta({
  title: pageData.seo?.title || pageData.title,
  ogTitle: pageData.seo?.title || pageData.title,
  description: pageData.seo?.description || pageData.description,
  ogDescription: pageData.seo?.description || pageData.description
})
</script>

<template>
  <div
    v-if="pageData"
    class="relative"
  >
    <div class="hidden lg:block">
      <UColorModeImage
        light="/images/light/line-1.svg"
        dark="/images/dark/line-1.svg"
        class="absolute pointer-events-none pb-10 left-0 top-0 object-cover h-[650px]"
      />
    </div>

    <UPageHero
      :description="pageData.description"
      :links="pageData.hero.links"
      :ui="{
        container: 'md:pt-18 lg:pt-20',
        title: 'max-w-3xl mx-auto'
      }"
    >
      <template #top>
        <HeroBackground />
      </template>

      <template #title>
        <MDC
          :value="pageData.title"
          unwrap="p"
        />
      </template>
    </UPageHero>

    <UPageSection
      :description="pageData.section.description"
      :features="pageData.section.features"
      orientation="horizontal"
      :ui="{
        container: 'lg:px-0 2xl:px-20 mx-0 max-w-none md:mr-10',
        features: 'gap-0'
      }"
      reverse
    >
      <template #title>
        <MDC
          :value="pageData.section.title"
          class="sm:*:leading-11"
        />
      </template>
      <img
        :src="pageData.section.images.desktop"
        :alt="pageData.section.title"
        class="hidden lg:block 2xl:hidden left-0 w-full max-w-2xl"
      >
      <img
        :src="pageData.section.images.mobile"
        :alt="pageData.section.title"
        class="block lg:hidden 2xl:block 2xl:w-full 2xl:max-w-2xl"
      >
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection
      id="features"
      :description="pageData.features.description"
      :features="pageData.features.features"
      :ui="{
        title: 'text-left @container relative flex',
        description: 'text-left'
      }"
      class="relative overflow-hidden"
    >
      <div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" />
      <div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" />
      <template #title>
        <MDC
          :value="pageData.features.title"
          class="*:leading-9"
        />
        <div class="hidden @min-[1020px]:block">
          <UColorModeImage
            light="/images/light/line-2.svg"
            dark="/images/dark/line-2.svg"
            class="absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
          />
        </div>
      </template>
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection
      id="steps"
      :description="pageData.steps.description"
      class="relative overflow-hidden"
    >
      <template #headline>
        <UColorModeImage
          light="/images/light/line-3.svg"
          dark="/images/dark/line-3.svg"
          class="absolute -top-10 sm:top-0 right-1/2 h-24"
        />
      </template>
      <template #title>
        <MDC :value="pageData.steps.title" />
      </template>

      <template #features>
        <UPageCard
          v-for="(step, index) in pageData.steps.items"
          :key="index"
          class="group"
          :ui="{ container: 'p-4 sm:p-4', title: 'flex items-center gap-1' }"
        >
          <UColorModeImage
            v-if="step.image"
            :light="step.image?.light"
            :dark="step.image?.dark"
            :alt="step.title"
            class="size-full"
          />

          <div class="flex flex-col gap-2">
            <span class="text-lg font-semibold">
              {{ step.title }}
            </span>
            <span class="text-sm text-muted">
              {{ step.description }}
            </span>
          </div>
        </UPageCard>
      </template>
    </UPageSection>

    <UPageSection
      id="pricing"
      class="mb-32 overflow-hidden"
      :title="pageData.pricing.title"
      :description="pageData.pricing.description"
      :ui="{ title: 'text-left @container relative', description: 'text-left' }"
    >
      <template #title>
        <MDC :value="pageData.pricing.title" />

        <div class="hidden @min-[1120px]:block">
          <UColorModeImage
            light="/images/light/line-4.svg"
            dark="/images/dark/line-4.svg"
            class="absolute top-0 right-0 size-full transform translate-x-[60%]"
          />
        </div>
      </template>

      <UPricingPlans scale>
        <UPricingPlan
          v-for="(plan, index) in pageData.pricing.plans"
          :key="index"
          :title="plan.title"
          :description="plan.description"
          :price="plan.price"
          :billing-period="plan.billing_period"
          :billing-cycle="plan.billing_cycle"
          :highlight="plan.highlight"
          :scale="plan.highlight"
          variant="soft"
          :features="plan.features"
          :button="plan.button"
        />
      </UPricingPlans>
    </UPageSection>

    <UPageSection
      id="testimonials"
      :title="pageData.testimonials.title"
      :description="pageData.testimonials.description"
      :items="pageData.testimonials.items"
    >
      <template #headline>
        <UColorModeImage
          light="/images/light/line-5.svg"
          dark="/images/dark/line-5.svg"
          class="absolute -top-10 sm:top-0 right-1/2 h-24"
        />
      </template>
      <template #title>
        <MDC :value="pageData.testimonials.title" />
      </template>

      <UContainer>
        <UPageColumns class="xl:columns-3">
          <UPageCard
            v-for="(testimonial, index) in pageData.testimonials.items"
            :key="index"
            variant="subtle"
            :description="testimonial.quote"
            :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
          >
            <template #footer>
              <UUser
                v-bind="testimonial.user"
                size="xl"
              />
            </template>
          </UPageCard>
        </UPageColumns>
      </UContainer>
    </UPageSection>

    <USeparator />

    <UPageCTA
      v-bind="pageData.cta"
      variant="naked"
      class="overflow-hidden @container"
    >
      <template #title>
        <MDC :value="pageData.cta.title" />

        <div class="@max-[1280px]:hidden">
          <UColorModeImage
            light="/images/light/line-6.svg"
            dark="/images/dark/line-6.svg"
            class="absolute left-10 -top-10 sm:top-0 h-full"
          />
          <UColorModeImage
            light="/images/light/line-7.svg"
            dark="/images/dark/line-7.svg"
            class="absolute right-0 bottom-0 h-full"
          />
        </div>
      </template>

      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
