export default defineEventHandler(async (event) => {
  const query = getQuery(event) || {}
  const category = String(query.category || '').trim()
  const slug = String(query.slug || '').trim()

  console.log('🔴 Articles resolve API called:', { category, slug, method: getMethod(event) })

  if (!category || !slug) {
    console.error('🔴 Articles resolve API: Missing parameters', { category, slug })
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
      console.log('🔴 Articles resolve API: Article not found', { category, slug })
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Validate article has required fields
    if (!article.id || !article.title) {
      console.error('🔴 Articles resolve API: Invalid article data', {
        hasId: !!article.id,
        hasTitle: !!article.title,
        hasCategories: !!(article.categories && Array.isArray(article.categories))
      })
      throw createError({ statusCode: 500, statusMessage: 'Invalid article data' })
    }

    // Define priority main categories
    const mainCategories = ['fudbal', 'kosarka', 'odbojka', 'tenis']

    // Validate categories exist and are valid
    if (!article.categories || !Array.isArray(article.categories) || article.categories.length === 0) {
      console.error('🔴 Articles resolve API: Article has no valid categories', {
        articleId: article.id,
        categories: article.categories
      })
      throw createError({ statusCode: 500, statusMessage: 'Article has no valid categories' })
    }

    // Find the correct category to use (prioritize main categories)
    let correctCategory = null

    // First, check if any of the article's categories matches the main categories
    for (const mainCat of mainCategories) {
      const foundMainCat = article.categories.find(cat => cat?.slug === mainCat)
      if (foundMainCat) {
        correctCategory = mainCat
        break
      }
    }

    // If no main category found, use the first category as fallback
    if (!correctCategory) {
      const firstCategory = article.categories.find(cat => cat?.slug)
      correctCategory = firstCategory?.slug
    }

    if (!correctCategory) {
      console.error('🔴 Articles resolve API: Could not determine correct category', {
        articleId: article.id,
        categories: article.categories.map(cat => ({ id: cat?.id, slug: cat?.slug, name: cat?.name }))
      })
      throw createError({ statusCode: 500, statusMessage: 'Could not determine article category' })
    }

    if (correctCategory !== category) {
      // If the requested category doesn't match the correct category, send a redirect response
      const correctUrl = `/${correctCategory}/${slug}`
      console.log('🔴 Articles resolve API: Redirecting', {
        from: `/${category}/${slug}`,
        to: correctUrl,
        reason: 'Category mismatch'
      })
      throw createError({
        statusCode: 301,
        statusMessage: 'Moved Permanently',
        headers: {
          Location: correctUrl
        },
        data: {
          redirectTo: correctUrl,
          message: `Redirect to: ${correctUrl}`
        }
      })
    }

    console.log('🔴 Articles resolve API: Returning article', {
      articleId: article.id,
      title: article.title?.substring(0, 50) + '...',
      category: correctCategory
    })
    return article
  } catch (err) {
    console.error('🔴 Articles resolve API error:', {
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
      message: err.message,
      category,
      slug
    })

    // Re-throw known errors (like 301 redirects)
    if (err && err.statusCode) throw err

    // For unknown errors, provide more context
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resolve article',
      data: { category, slug, originalError: err.message }
    })
  }
})


