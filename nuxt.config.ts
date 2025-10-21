// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { config as loadDotenv } from 'dotenv'
// Load environment variables from .env before Nuxt reads them
loadDotenv()
// Get GTM Container ID from environment or use default
const gtmId = process.env.NUXT_PUBLIC_GTM_ID || process.env.GTM_ID || 'GTM-MDNMRBXM'
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
    componentIslands: true,
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
      // RSS feed routes - Must be defined BEFORE other routes to take precedence
      // Don't set cache-control here - let the route handler set it to avoid conflicts
      '/feed.xml': { swr: false },
      '/fudbal/feed.xml': { swr: false },
      '/kosarka/feed.xml': { swr: false },
      '/tenis/feed.xml': { swr: false },
      '/odbojka/feed.xml': { swr: false },
      '/ostali-sportovi/feed.xml': { swr: false },
      '/najnovije-vesti/feed.xml': { swr: false },
      // Redirect old URL to new URL
      '/nove-vesti': { redirect: { to: '/najnovije-vesti', statusCode: 301 } },
      '/nove-vesti/**': { redirect: { to: '/najnovije-vesti', statusCode: 301 } },
      // Enable SSR for all main routes with caching
      '/': { ssr: true, swr: 60, headers: {
        'Content-Security-Policy':
          "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://platform.twitter.com https://*.twitter.com https://www.googletagmanager.com https://widgets.sofascore.com https://*.sofascore.com;"
      } }, // Cache for 60 seconds
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
          'Link': '</fonts.googleapis.com>; rel=preconnect; crossorigin, </fonts.gstatic.com>; rel=preconnect; crossorigin',
          'Content-Security-Policy':
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://platform.twitter.com https://*.twitter.com https://www.googletagmanager.com https://widgets.sofascore.com https://*.sofascore.com;"
        }
      }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',
  css: [
    '~/assets/css/fonts.css', // Load fonts first (SSR) to prevent FOUT
    '~/assets/css/main.css',
    'swiper/css',
    'swiper/css/navigation'
  ],
  app: {
    // Disable keepalive to allow proper cache invalidation
    keepalive: false,
    head: {
      htmlAttrs: {
        lang: 'sr'
      },
      meta: [
        // PWA theme color for mobile browsers
        { name: 'theme-color', content: '#0D1519' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      script: [
        // Google Tag Manager (GTM) - OPTIMIZED: Load on user interaction or after 3s
        {
          innerHTML: `
            (function(w,d,s,l,i){
              var gtmLoaded = false;
              function loadGTM() {
                if (gtmLoaded) return;
                gtmLoaded = true;
                w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              }

              // Load GTM on first user interaction (click, scroll, or touch)
              var events = ['mousedown', 'touchstart', 'scroll', 'keydown'];
              events.forEach(function(event) {
                w.addEventListener(event, loadGTM, { once: true, passive: true });
              });

              // Fallback: Load after 3 seconds if no interaction
              setTimeout(loadGTM, 3000);
            })(window,document,'script','dataLayer','${gtmId}');
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
        // Web App Manifest for PWA support
        { rel: 'manifest', href: '/site.webmanifest' },
        // Preconnect to ONLY the most critical origins
        { rel: 'preconnect', href: 'https://meridian.mpanel.app' },
        // Critical: Preconnect to S3 image CDN for LCP optimization
        { rel: 'preconnect', href: 'https://mer-static.s3.eu-central-1.amazonaws.com' },
        // DNS prefetch for less critical origins
        { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        // NOTE: Main fonts (Roboto, Roboto Condensed, Barlow Condensed, Urbanist, Source Sans Pro)
        // are now loaded locally via @fontsource in plugins/fonts.client.js for better performance
        // Non-critical icon fonts - defer loading to improve LCP
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
      GTM_ID: process.env.NUXT_PUBLIC_GTM_ID || process.env.GTM_ID || 'GTM-MDNMRBXM',
      // Deprecated: GA_MEASUREMENT_ID - now using GTM instead
      GA_MEASUREMENT_ID: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-D36YF7TZJF'
    }
  },
})