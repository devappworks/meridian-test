/**
 * Get canonical category for articles
 * Converts sub-categories to their corresponding main categories
 */
export function getCanonicalCategory(articleCategories, currentCategory) {
  if (!articleCategories || !Array.isArray(articleCategories)) {
    return currentCategory;
  }

  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi'];

  // Extract category names/slugs from the article categories
  const categoryNames = articleCategories
    .map(cat => {
      // Handle different category data structures
      if (typeof cat === 'string') return cat;
      if (cat.slug) return cat.slug;
      if (cat.name) return cat.name.toLowerCase();
      return null;
    })
    .filter(Boolean)
    .map(name => name.toLowerCase());

  // Find if any main category exists in the article categories
  const foundMainCategory = mainCategories.find(mainCat =>
    categoryNames.includes(mainCat)
  );

  if (foundMainCategory) {
    // Use the main category as canonical
    return foundMainCategory;
  } else {
    // Use the first category as canonical if no main category found
    return categoryNames[0] || currentCategory;
  }
}

/**
 * Convert category slug to canonical form
 * This maps common sub-categories to their main categories
 */
export function getCanonicalCategoryFromSlug(categorySlug) {
  if (!categorySlug) return categorySlug;

  const slug = categorySlug.toLowerCase();

  // Map of sub-categories to main categories
  const categoryMap = {
    // Football sub-categories
    'domaci-fudbal': 'fudbal',
    'domai-fudbal': 'fudbal',
    'reprezentacije': 'fudbal',
    'evropska-takmicenja': 'fudbal',
    'liga-sampiona': 'fudbal',
    'liga-europa': 'fudbal',
    'superligasrbije': 'fudbal',
    'super-liga-srbije': 'fudbal',

    // Basketball sub-categories
    'domaca-kosarka': 'kosarka',
    'aba-liga': 'kosarka',
    'evroliga': 'kosarka',
    'nba': 'kosarka',
    'eurobasket': 'kosarka',

    // Tennis sub-categories
    'atp': 'tenis',
    'wta': 'tenis',
    'grand-slam': 'tenis',
    'masters': 'tenis',
    'davis-cup': 'tenis',

    // Volleyball sub-categories
    'domaca-odbojka': 'odbojka',
    'liga-sampiona-odbojka': 'odbojka',

    // Other sports
    'rukomet': 'ostali-sportovi',
    'atletika': 'ostali-sportovi',
    'plivanje': 'ostali-sportovi',
    'gimnastika': 'ostali-sportovi',
    'borilacke-vestine': 'ostali-sportovi',
    'automoto': 'ostali-sportovi',
    'biciklizam': 'ostali-sportovi',
    'zimski-sportovi': 'ostali-sportovi',
    'esports': 'ostali-sportovi',
    'intervjui': 'ostali-sportovi',
    'sport-fokus': 'ostali-sportovi',
    'sportska-geografija': 'ostali-sportovi',
  };

  return categoryMap[slug] || slug;
}