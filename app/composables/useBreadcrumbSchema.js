export function useBreadcrumbSchema(breadcrumbs) {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.SITE_URL || '').replace(/\/$/, '');

  if (!breadcrumbs || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return null;
  }

  const itemListElement = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url?.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}
