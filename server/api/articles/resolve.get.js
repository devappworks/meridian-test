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

  // Helper function to get related categories
  const getRelatedCategories = (cat) => {
    const categoryMap = {
      'fudbal': ['fudbal', 'domaci-fudbal', 'reprezentacije', 'evropska-takmicenja'],
      'kosarka': ['kosarka', 'domaca-kosarka', 'aba-liga', 'evroliga', 'nba'],
      'tenis': ['tenis', 'atp', 'wta', 'grand-slam'],
      'odbojka': ['odbojka', 'domaca-odbojka'],
      'ostali-sportovi': ['ostali-sportovi', 'rukomet', 'atletika', 'plivanje']
    }
    return categoryMap[cat.toLowerCase()] || [cat]
  }

  try {
    // Try to fetch with the requested category first
    let response
    let article
    const categoriesToTry = getRelatedCategories(category)

    console.log('🔴 Articles resolve API: Trying categories:', categoriesToTry)

    // Try each related category until we find the article
    for (const tryCategory of categoriesToTry) {
      try {
        response = await $fetch(`${config.public.BACKEND_URL}/getArticlesBySlug/${tryCategory}/${slug}`, {
          headers,
        })
        article = response?.article
        if (article && typeof article === 'object' && article.id) {
          console.log(`🔴 Articles resolve API: Article found under category: ${tryCategory}`)
          break
        }
      } catch (err) {
        console.log(`🔴 Articles resolve API: Not found under ${tryCategory}, trying next...`)
        continue
      }
    }

    if (!article || typeof article !== 'object') {
      console.log('🔴 Articles resolve API: Article not found in any category', { category, slug, tried: categoriesToTry })
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
    const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']

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

    // Note: Removed redirect logic from API endpoint to prevent double redirects
    // Server middleware (canonical-redirect.js) now handles all category redirects
    // This API endpoint now only returns article data

    if (correctCategory !== category) {
      // Log the mismatch but don't redirect - let the middleware handle it
      console.log('🔴 Articles resolve API: Category mismatch detected (will be handled by middleware)', {
        requestedCategory: category,
        correctCategory: correctCategory,
        articleId: article.id
      })
      // Still return the article data - middleware will handle the redirect
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


