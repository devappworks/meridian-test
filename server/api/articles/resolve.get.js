export default defineEventHandler(async (event) => {
  const query = getQuery(event) || {}
  const category = String(query.category || '').trim()
  const slug = String(query.slug || '').trim()

  if (!category || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category or slug' })
  }

  const config = useRuntimeConfig()
  const headers = {}
  if (config.API_KEY) headers.Authorization = config.API_KEY
  else if (config.public.API_KEY) headers.Authorization = config.public.API_KEY

  try {
    // Use the same endpoint that the client-side uses
    const response = await $fetch(`${config.public.BACKEND_URL}/getArticlesBySlug/${category}/${slug}`, {
      headers,
    })

    const article = response?.article
    if (!article || typeof article !== 'object') {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Define priority main categories
    const mainCategories = ['fudbal', 'kosarka', 'odbojka', 'tenis']

    // Find the correct category to use (prioritize main categories)
    let correctCategory = null

    // First, check if any of the article's categories matches the main categories
    for (const mainCat of mainCategories) {
      const foundMainCat = article.categories?.find(cat => cat.slug === mainCat)
      if (foundMainCat) {
        correctCategory = mainCat
        break
      }
    }

    // If no main category found, use the first category as fallback
    if (!correctCategory) {
      correctCategory = article.categories?.[0]?.slug
    }

    if (!correctCategory || correctCategory !== category) {
      // If the requested category doesn't match the correct category, redirect to the correct URL
      const correctUrl = `/${correctCategory}/${slug}`
      throw createError({
        statusCode: 301,
        statusMessage: 'Moved Permanently',
        data: { redirectTo: correctUrl }
      })
    }

    return article
  } catch (err) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to resolve article' })
  }
})


