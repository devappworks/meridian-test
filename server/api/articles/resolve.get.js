export default defineEventHandler(async (event) => {
  const query = getQuery(event) || {}
  const category = String(query.category || '').trim()
  const slug = String(query.slug || '').trim()

  console.log('\n🔵 ============ RESOLVE API START ============')
  console.log('🔵 Articles resolve API called:', { 
    category, 
    slug, 
    method: getMethod(event),
    timestamp: new Date().toISOString(),
    fullUrl: event.node.req.url
  })

  if (!category || !slug) {
    console.error('🔴 Articles resolve API: Missing parameters', { category, slug })
    throw createError({ statusCode: 400, statusMessage: 'Missing category or slug' })
  }

  const config = useRuntimeConfig()
  const headers = {}
  if (config.API_KEY) headers.Authorization = config.API_KEY
  else if (config.public.API_KEY) headers.Authorization = config.public.API_KEY
  
  console.log('🔵 Config loaded:', {
    backendUrl: config.public.BACKEND_URL,
    hasApiKey: !!(config.API_KEY || config.public.API_KEY)
  })

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

    console.log('🔵 Articles resolve API: Will try categories:', categoriesToTry)

    // Try each related category until we find the article
    for (let i = 0; i < categoriesToTry.length; i++) {
      const tryCategory = categoriesToTry[i]
      const apiUrl = `${config.public.BACKEND_URL}/getArticlesBySlug/${tryCategory}/${slug}`
      
      console.log(`\n🔵 [Attempt ${i + 1}/${categoriesToTry.length}] Trying category: ${tryCategory}`)
      console.log(`🔵 API URL: ${apiUrl}`)
      
      try {
        const fetchStart = Date.now()
        response = await $fetch(apiUrl, {
          headers,
        })
        const fetchDuration = Date.now() - fetchStart
        
        console.log(`🔵 [Attempt ${i + 1}] Response received in ${fetchDuration}ms`)
        console.log(`🔵 [Attempt ${i + 1}] Response structure:`, {
          hasResponse: !!response,
          hasArticle: !!response?.article,
          articleId: response?.article?.id,
          articleTitle: response?.article?.title?.substring(0, 50),
          hasRedirectUrl: !!response?.redirect_url,
          redirectUrl: response?.redirect_url
        })

        article = response?.article

        // Check if response has a redirect_url and attach it to the article
        if (response?.redirect_url && typeof response.redirect_url === 'string' && response.redirect_url.trim() !== '') {
          const redirectUrl = response.redirect_url.trim()
          console.log(`🔴 [Attempt ${i + 1}] Response has redirect_url, attaching to article`, {
            articleId: article?.id,
            redirectUrl: redirectUrl
          })
          // Attach redirect_url to article object so the page can handle it
          if (article && typeof article === 'object') {
            article._redirect_url = redirectUrl
          }
        }

        if (article && typeof article === 'object' && article.id) {
          console.log(`✅ [Attempt ${i + 1}] SUCCESS! Article found under category: ${tryCategory}`)
          console.log(`✅ Article details:`, {
            id: article.id,
            title: article.title,
            hasCategories: !!article.categories,
            categoryCount: article.categories?.length
          })
          break
        } else {
          console.log(`⚠️ [Attempt ${i + 1}] Response received but no valid article object`)
        }
      } catch (err) {
        console.log(`❌ [Attempt ${i + 1}] Error fetching from ${tryCategory}:`, {
          message: err.message,
          statusCode: err.statusCode,
          statusMessage: err.statusMessage,
          data: err.data
        })
        continue
      }
    }

    if (!article || typeof article !== 'object') {
      console.log('\n❌ Articles resolve API: Article not found in any category')
      console.log('❌ Search summary:', { 
        requestedCategory: category, 
        slug: slug, 
        categoriesTried: categoriesToTry,
        triedCount: categoriesToTry.length
      })
      console.log('🔵 ============ RESOLVE API END (NOT FOUND) ============\n')
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

    console.log('\n✅ Articles resolve API: Returning article')
    console.log('✅ Final article data:', {
      articleId: article.id,
      title: article.title?.substring(0, 50) + '...',
      correctCategory: correctCategory,
      requestedCategory: category,
      categoryMatch: correctCategory === category,
      hasCategories: !!article.categories,
      categoryCount: article.categories?.length
    })
    console.log('🔵 ============ RESOLVE API END (SUCCESS) ============\n')
    return article
  } catch (err) {
    console.error('\n❌ Articles resolve API - FATAL ERROR:', {
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
      message: err.message,
      category,
      slug,
      stack: err.stack
    })
    console.log('🔵 ============ RESOLVE API END (ERROR) ============\n')

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


