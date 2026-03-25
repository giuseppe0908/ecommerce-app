import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { buildCanonicalUrl, buildRobotsValue, normalizeBaseUrl, toAbsoluteUrl, truncateText } from '~/utils/seo'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type SeoMetaType =
  | 'article'
  | 'website'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_status'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other'

type PageSeoOptions = {
  title: MaybeRef<string>
  description: MaybeRef<string>
  path?: MaybeRef<string | undefined>
  image?: MaybeRef<string | undefined | null>
  index?: MaybeRef<boolean>
  follow?: MaybeRef<boolean>
  type?: MaybeRef<SeoMetaType | undefined>
}

export function usePageSeo(options: PageSeoOptions) {
  const config = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const route = useRoute()

  const siteName = computed(() => String(config.public.siteName || 'Nuxt Commerce'))
  const baseUrl = computed(() => normalizeBaseUrl(config.public.appBaseUrl || requestUrl.origin))
  const canonicalPath = computed(() => String(unref(options.path) || route.path || '/'))
  const canonicalUrl = computed(() => buildCanonicalUrl(baseUrl.value, canonicalPath.value))
  const metaTitle = computed(() => String(unref(options.title) || '').trim())
  const metaDescription = computed(() => truncateText(String(unref(options.description) || ''), 160))
  const robots = computed(() =>
    buildRobotsValue({
      index: unref(options.index) !== false,
      follow: unref(options.follow) !== false,
    })
  )
  const metaType = computed<SeoMetaType>(() => unref(options.type) || 'website')
  const metaImage = computed(() => {
    const resolvedImage = unref(options.image)
    return resolvedImage ? toAbsoluteUrl(baseUrl.value, resolvedImage) : undefined
  })

  useSeoMeta({
    title: metaTitle,
    description: metaDescription,
    robots,
    ogSiteName: siteName,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogUrl: canonicalUrl,
    ogType: metaType,
    ogImage: metaImage,
    twitterCard: computed(() => (metaImage.value ? 'summary_large_image' : 'summary')),
    twitterTitle: metaTitle,
    twitterDescription: metaDescription,
    twitterImage: metaImage,
  })

  useHead(() => ({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl.value,
      },
    ],
  }))

  return {
    baseUrl,
    canonicalUrl,
    siteName,
  }
}

export function useNoIndexPageSeo(options: Omit<PageSeoOptions, 'index' | 'follow'>) {
  return usePageSeo({
    ...options,
    index: false,
    follow: false,
  })
}
