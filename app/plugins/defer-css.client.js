/**
 * Add noscript fallback for deferred stylesheets
 * This ensures CSS loads even if JavaScript is disabled
 */
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Find all stylesheets that were deferred with media="print"
    const deferredStyles = document.querySelectorAll('link[rel="stylesheet"][media="print"]');

    deferredStyles.forEach(link => {
      // Create a noscript fallback
      const noscript = document.createElement('noscript');
      const fallbackLink = link.cloneNode();
      fallbackLink.removeAttribute('media');
      fallbackLink.removeAttribute('onload');
      noscript.appendChild(fallbackLink);
      link.parentNode.insertBefore(noscript, link.nextSibling);
    });
  }
});
