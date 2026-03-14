export function getArticleStatusOptions() {
  return [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ]
}

export function getArticleCategoryOptions() {
  return [
    { label: 'Tech', value: 'tech' },
    { label: 'Design', value: 'design' },
    { label: 'Product', value: 'product' },
    { label: 'Other', value: 'other' },
  ]
}

export function getArticleStatusEnum() {
  return {
    draft: { text: 'Draft', status: 'Default' },
    published: { text: 'Published', status: 'Success' },
    archived: { text: 'Archived', status: 'Warning' },
  } as const
}

export function getArticleCategoryEnum() {
  return {
    tech: { text: 'Tech' },
    design: { text: 'Design' },
    product: { text: 'Product' },
    other: { text: 'Other' },
  } as const
}
