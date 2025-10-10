/**
 * Get the correct category slug for an article
 * If the article's category has a parent, return the parent slug
 * Otherwise return the category slug itself
 */
export function useArticleCategory(article) {
  if (!article || !article.categories || !Array.isArray(article.categories) || article.categories.length === 0) {
    return null
  }

  const category = article.categories[0]

  // If category has a parent_id and parent_category exists, use parent
  if (category.parent_id && article.parent_category) {
    return article.parent_category.slug || article.parent_category.name?.toLowerCase()
  }

  // Otherwise use the category itself
  return category.slug || category.name?.toLowerCase()
}
