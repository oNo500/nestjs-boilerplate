import type { TFunction } from 'i18next'

export function getArticleStatusOptions(t: TFunction<'scaffold'>) {
  return [
    { label: t('status.draft'), value: 'draft' },
    { label: t('status.published'), value: 'published' },
    { label: t('status.archived'), value: 'archived' },
  ]
}

export function getArticleCategoryOptions(t: TFunction<'scaffold'>) {
  return [
    { label: t('category.tech'), value: 'tech' },
    { label: t('category.design'), value: 'design' },
    { label: t('category.product'), value: 'product' },
    { label: t('category.other'), value: 'other' },
  ]
}

export function getArticleStatusEnum(t: TFunction<'scaffold'>) {
  return {
    draft: { text: t('status.draft'), status: 'Default' },
    published: { text: t('status.published'), status: 'Success' },
    archived: { text: t('status.archived'), status: 'Warning' },
  } as const
}

export function getArticleCategoryEnum(t: TFunction<'scaffold'>) {
  return {
    tech: { text: t('category.tech') },
    design: { text: t('category.design') },
    product: { text: t('category.product') },
    other: { text: t('category.other') },
  } as const
}
