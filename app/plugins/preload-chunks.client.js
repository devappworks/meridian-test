/**
 * Add modulepreload hints for critical JavaScript chunks
 * This allows the browser to preload JS modules in parallel
 */
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Get all script tags
    const scripts = document.querySelectorAll('script[type="module"]');

    scripts.forEach(script => {
      if (script.src && script.src.includes('/_nuxt/')) {
        // Check if preload already exists
        const existingPreload = document.querySelector(`link[rel="modulepreload"][href="${script.src}"]`);

        if (!existingPreload) {
          const link = document.createElement('link');
          link.rel = 'modulepreload';
          link.href = script.src;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      }
    });
  }
});
