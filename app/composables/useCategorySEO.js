/**
 * Composable for category page SEO metadata
 * Provides consistent SEO tags across all category pages
 */
export function useCategorySEO(categorySlug) {
  const config = useRuntimeConfig()
  const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '')
  const siteName = config.public?.SITE_NAME || 'Meridian Sport'

  // Category metadata configuration
  const categoryData = {
    'najnovije-vesti': {
      name: 'Najnovije vesti',
      title: 'Najnovije vesti Meridian Sport',
      description: 'Najnovije sportske vesti sa Meridian Sport portala! Fudbal, košarka, odbojka i svi aktuelni događaji iz Srbije i sveta, na jednom mestu.'
    },
    'fudbal': {
      name: 'Fudbal',
      title: 'Fudbal Meridian Sport',
      description: 'Najnovije fudbalske vesti sa Meridian Sport portala! Rezultati, transferi, analize i priče iz domaćeg i svetskog fudbala.'
    },
    'kosarka': {
      name: 'Košarka',
      title: 'Košarka Meridian Sport',
      description: 'Meridian Sport prati sve iz sveta košarke! Utakmice, transferi, izveštaji i ekskluzive iz domaćih i stranih liga.'
    },
    'tenis': {
      name: 'Tenis',
      title: 'Tenis Meridian Sport',
      description: 'Meridian Sport donosi najnovije vesti iz tenisa! ATP, WTA, Grand Slam turniri, rezultati i analize.'
    },
    'odbojka': {
      name: 'Odbojka',
      title: 'Odbojka Meridian Sport',
      description: 'Pratite Meridian Sport za najnovije vesti iz odbojke - rezultati, transferi, izveštaji i sve što zanima ljubitelje odbojke.'
    },
    'ostali-sportovi': {
      name: 'Ostali sportovi',
      title: 'Ostali sportovi Meridian Sport',
      description: 'Meridian Sport donosi aktuelne vesti iz ostalih sportova - atletika, borilački sportovi, rukomet, plivanje i više.'
    }
  }

  const category = categoryData[categorySlug]
  if (!category) {
    console.warn(`[useCategorySEO] Unknown category: ${categorySlug}`)
    return null
  }

  const canonicalUrl = `${siteUrl}/${categorySlug}/`
  const ogImageUrl = `${siteUrl}/images/default-category-og.jpg`
  const logoUrl = `${siteUrl}/images/meridian-favicon-512x512.png`

  // CollectionPage structured data
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.title,
    description: category.description,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Meridian Sport',
      url: 'https://meridiansport.rs/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://meridiansport.rs/images/meridian-favicon-512x512.png',
        width: 512,
        height: 512
      },
      sameAs: [
        'https://www.facebook.com/SportMeridian/',
        'https://www.instagram.com/meridiansportrs/',
        'https://www.youtube.com/@meridiansport',
        'https://x.com/meridiansportrs'
      ]
    }
  }

  // BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: canonicalUrl
      }
    ]
  }

  return {
    title: category.title,
    meta: [
      // Basic meta tags
      { name: 'description', content: category.description },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },

      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: category.title },
      { property: 'og:description', content: category.description },
      { property: 'og:image', content: ogImageUrl },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: siteName },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: category.title },
      { name: 'twitter:description', content: category.description },
      { name: 'twitter:image', content: ogImageUrl }
    ],
    link: [
      // Self-referencing canonical
      { rel: 'canonical', href: canonicalUrl }
    ],
    script: [
      // CollectionPage structured data
      {
        key: `ldjson-collection-${categorySlug}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(collectionSchema)
      },
      // BreadcrumbList structured data
      {
        key: `ldjson-breadcrumb-${categorySlug}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbSchema)
      }
    ]
  }
}
