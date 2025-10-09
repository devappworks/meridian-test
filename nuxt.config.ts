// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { config as loadDotenv } from 'dotenv'
// Load environment variables from .env before Nuxt reads them
loadDotenv()
// Get GA measurement ID from environment or use default
const gaMeasurementId = process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-D36YF7TZJF'
export default defineNuxtConfig({
  // Enable SSR for all routes
  ssr: true,
  // Dev server configuration - allow external access
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  // Performance optimizations
  experimental: {
    payloadExtraction: true,
    viewTransition: true,
    componentIslands: true
  },
  // Inline critical CSS to prevent render blocking (Nuxt 4 way)
  features: {
    inlineStyles: true
  },
  nitro: {
    preset: 'node-server',
    // Remove static output configuration for SSR
    // Server will generate HTML at runtime instead of build time
    experimental: {
      wasm: true
    },
    // Disable build manifest to avoid 500 errors
    buildDir: '.output',
    // Enable compression
    compressPublicAssets: true,
    // Enable minification
    minify: true,
    // Add modulepreload hints for better parallel loading
    prerender: {
      crawlLinks: false
    },
    routeRules: {
      // Redirect old URL to new URL
      '/nove-vesti': { redirect: { to: '/najnovije-vesti', statusCode: 301 } },
      '/nove-vesti/**': { redirect: { to: '/najnovije-vesti', statusCode: 301 } },
      // Enable SSR for all main routes with caching
      '/': { ssr: true, swr: 60 }, // Cache for 60 seconds
      '/fudbal': { ssr: true, swr: 60 },
      '/kosarka': { ssr: true, swr: 60 },
      '/tenis': { ssr: true, swr: 60 },
      '/najnovije-vesti': { ssr: true, swr: 60 },
      '/odbojka': { ssr: true, swr: 60 },
      '/ostali-sportovi': { ssr: true, swr: 60 },
      // Tag pages - enable SSR with short cache
      '/tag/**': { ssr: true, swr: 60 },
      // Cache static assets for 1 year
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/images/**': { headers: { 'cache-control': 'public, max-age=2592000' } }, // 30 days
      // Cache public assets (fonts, images, etc)
      '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      // Enable SSR for all routes by default
      '/**': {
        ssr: true,
        headers: {
          // Add Link preload headers for HTTP/2 Server Push
          'Link': '</fonts.googleapis.com>; rel=preconnect; crossorigin, </fonts.gstatic.com>; rel=preconnect; crossorigin'
        }
      }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',
  css: [
    '~/assets/css/main.css',
    'swiper/css',
    'swiper/css/navigation'
  ],
  app: {
    head: {
      htmlAttrs: {
        lang: 'sr'
      },
      script: [
        // Google Analytics 4 (GA4) - defer until after page load to improve LCP
        {
          innerHTML: `
          window.addEventListener('load', function() {
            var script = document.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}';
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure;max-age=63072000',
              anonymize_ip: true,
              cookie_expires: 63072000
            });
          });
          `,
          type: 'text/javascript'
        }
        // Bootstrap JS and jQuery removed - not used in the application
        // Using custom dropdowns, modals, and Vue.js instead
      ],
      link: [
        // Favicon - Multiple sizes for better device support
        { rel: 'icon', type: 'image/x-icon', href: '/images/meridian-favicon-1758622126.png' },
        { rel: 'apple-touch-icon', href: '/images/meridian-favicon-1758622126.png' },
        { rel: 'shortcut icon', href: '/images/meridian-favicon-1758622126.png' },
        // Preconnect to ONLY the most critical origins (max 3 for optimal performance)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://meridian.mpanel.app' },
        // DNS prefetch for less critical origins
        { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        // Critical fonts - preload + async load to avoid render blocking
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@300;400;500;700&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@300;400;500;700&display=swap',
          media: 'print',
          onload: "this.media='all'"
        },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
          media: 'print',
          onload: "this.media='all'"
        },
        // Less critical fonts - defer loading
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap',
          media: 'print',
          onload: "this.media='all'"
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap',
          media: 'print',
          onload: "this.media='all'"
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
          media: 'print',
          onload: "this.media='all'"
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
          crossorigin: 'anonymous',
          media: 'print',
          onload: "this.media='all'"
        },
      ],
    }
  },
  vite: {
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.API_KEY || process.env.NUXT_PUBLIC_API_KEY || ''),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || process.env.NUXT_PUBLIC_BACKEND_URL || ''),
      'import.meta.env.VITE_COMMENT_BACKEND_URL': JSON.stringify(process.env.COMMENT_BACKEND_URL || process.env.NUXT_PUBLIC_COMMENT_BACKEND_URL || '')
    },
    esbuild: {
      // Remove console.log, console.warn, console.error in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      // Enable tree-shaking for better dead code elimination
      treeShaking: true,
      // Aggressive minification
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true
    },
    build: {
      // Minify HTML in production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
          // Aggressive optimizations
          passes: 2,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_proto: true
        },
        format: {
          comments: false  // Remove comments from production build
        },
        mangle: {
          safari10: true // Better browser compatibility
        }
      },
      // Disable CSS code splitting to reduce critical path chain
      // Inlining is handled by inlineSSRStyles instead
      cssCodeSplit: false,
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000,
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          // Aggressive code splitting to reduce entry bundle size
          manualChunks(id: string) {
            // Group all node_modules into vendor chunk
            if (id.includes('node_modules')) {
              // Separate large libraries that are used across many components
              if (id.includes('swiper')) {
                return 'swiper-vendor';
              }
              if (id.includes('vue') || id.includes('vue-router')) {
                return 'vue-vendor';
              }
              // All other vendors in one chunk
              return 'vendor';
            }
            // Split large components into separate chunks
            if (id.includes('app/components/NewsSlider')) {
              return 'news-slider';
            }
            if (id.includes('app/components/Featured')) {
              return 'featured';
            }
            if (id.includes('app/views/')) {
              return 'views';
            }
          },
          // Optimize asset file names for better caching
          chunkFileNames: '_nuxt/[name]-[hash].js',
          entryFileNames: '_nuxt/[name]-[hash].js',
          assetFileNames: '_nuxt/[name]-[hash][extname]'
        }
      },
      // Enable modulepreload polyfill for better browser support
      modulePreload: {
        polyfill: true
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  },
  runtimeConfig: {
    public: {
      BACKEND_URL: process.env.NUXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://meridian.mpanel.app/api/webV3',
      COMMENT_BACKEND_URL: process.env.NUXT_PUBLIC_COMMENT_BACKEND_URL || 'https://meridian.mpanel.app/api/v1/ios',
      API_KEY: process.env.NUXT_PUBLIC_API_KEY || '',
      SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://meridiansport.rs',
      SITE_NAME: process.env.NUXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Meridian Sport',
      SITE_DESCRIPTION: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || process.env.SITE_DESCRIPTION || 'Sve sportske vesti na jednom mestu – fudbal, košarka, tenis i još mnogo toga. Meridian Sport donosi najbrže informacije i analize.',
      TWITTER_HANDLE: process.env.NUXT_PUBLIC_TWITTER_HANDLE || process.env.TWITTER_HANDLE || '',
      GA_MEASUREMENT_ID: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-D36YF7TZJF'
    }
  },
})