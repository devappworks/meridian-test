export function useBreadcrumbSchema(breadcrumbs, siteUrl = '') {
  if (!breadcrumbs || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return null;
  }

  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  const itemListElement = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url?.startsWith('http') ? crumb.url : `${cleanSiteUrl}${crumb.url}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}
