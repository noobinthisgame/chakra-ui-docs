import { allDocs, Doc } from 'contentlayer/generated'
import { MixedArray, toArray, uniq } from './js-utils'

export function getDocByType(id: string) {
  return allDocs.filter((doc) => doc.slug.includes(`/docs/${id}`))
}

function toCapitalized(str: string) {
  const result = str.charAt(0).toUpperCase() + str.slice(1)
  return result.replace(/-/g, ' ')
}

export function getGroupedComponents() {
  return getDocByType('components').reduce((acc, doc) => {
    const category = doc.category
    if (!category) return acc
    acc[toCapitalized(category)] ??= []
    acc[toCapitalized(category)].push(doc)
    return acc
  }, {} as { [key: string]: any[] })
}

const getUsageDoc = (id: string) => {
  return allDocs.find((_doc) => _doc.id === id && _doc.scope === 'usage')
}

export const getDocDoc = (
  slug: MixedArray,
  locale: string,
  defaultLocale: string,
): Doc | undefined => {
  const params = toArray(slug)
  const _slug = params.join('/')

  // Find a doc for the current locale
  let doc = allDocs.find(
    (doc) =>
      doc.slug.startsWith(`/${locale}`) &&
      (doc.slug.endsWith(_slug) || doc.slug.endsWith(`${_slug}/usage`)),
  ) as Doc | undefined

  if (!doc) {
    // Find a doc for the default locale to use as fallback instead of 404 redirect
    const fallbackDoc = allDocs.find(
      (doc) =>
        doc.slug.startsWith(`/${defaultLocale}`) &&
        (doc.slug.endsWith(_slug) || doc.slug.endsWith(`${_slug}/usage`)),
    ) as Doc | undefined

    if (!fallbackDoc) return

    doc = fallbackDoc
  }

  // the presence of scope, means its a component documentation
  if (doc.scope && doc.scope !== 'usage') {
    doc.frontMatter = {
      ...doc.frontMatter,
      ...(getUsageDoc(doc.id)?.frontMatter ?? {}),
    }
  }

  return doc
}

export type TabsData = ReturnType<typeof getComponentTabsData>

export function getComponentTabsData(
  slug: MixedArray,
  locale: string,
  defaultLocale: string,
) {
  const params = toArray(slug)
  const _slug = params.join('/')

  const getSlug = (id: string) => {
    const res = uniq([...params, id])
    if (res.length > 3) res.splice(2, 1)
    return res
  }

  const usageSlug = getSlug('usage')
  const propsSlug = getSlug('props')
  const themingSlug = getSlug('theming')

  const data = [
    {
      id: 'usage',
      match: _slug.endsWith('/usage') || params.length === 2,
      href: { query: { slug: usageSlug.slice(1) } },
      label: 'Usage',
      doc: getDocDoc(getSlug('usage'), locale, defaultLocale),
    },
    {
      id: 'props',
      match: _slug.endsWith('/props'),
      href: { query: { slug: propsSlug.slice(1) } },
      label: 'Props',
      doc: getDocDoc(getSlug('props'), locale, defaultLocale),
    },
    {
      id: 'theming',
      match: _slug.endsWith('/theming'),
      label: 'Theming',
      href: { query: { slug: themingSlug.slice(1) } },
      doc: getDocDoc(getSlug('theming'), locale, defaultLocale),
    },
  ]
  return data.filter((item) => item.doc)
}
