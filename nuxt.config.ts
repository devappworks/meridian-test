// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { config as loadDotenv } from 'dotenv'

// Load environment variables from .env before Nuxt reads them
loadDotenv()

export default defineNuxtConfig({
  // Enable SSR for all routes
  ssr: true,
  
  nitro: {
    preset: 'node-server',
    // Remove static output configuration for SSR
    // Server will generate HTML at runtime instead of build time
    experimental: {
      wasm: true
    },
    // Disable build manifest to avoid 500 errors
    buildDir: '.output',
    routeRules: {
      // Enable SSR for all main routes
      '/': { ssr: true },
      '/fudbal': { ssr: true },
      '/kosarka': { ssr: true },
      '/tenis': { ssr: true },
      '/najnovije-vesti': { ssr: true },
      '/odbojka': { ssr: true },
      // Enable SSR for all routes by default
      '/**': { ssr: true }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      script: [
        // Google Tag Manager - must be first in head
        { src: "https://www.googletagmanager.com/gtag/js?id=G-D36YF7TZJF" },
        {innerHTML: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-D36YF7TZJF')`,
          type: 'text/javascript'
        },
        { 
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                      })(window,document,'script','dataLayer','G-D36YF7TZJF');`,
          type: 'text/javascript'
        },
        { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js', integrity: 'sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4', crossorigin: 'anonymous', tagPosition: 'bodyClose' },
        { src: 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js', tagPosition: 'bodyClose' }
      ],
      link: [
        // Preload critical CSS with high priority
        { rel: 'preload', as: 'style', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css' },
        { rel: 'preload', as: 'style', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css' },
        // Load stylesheets
        { rel: 'stylesheet', integrity: 'sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65', crossorigin: 'anonymous', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css', crossorigin: 'anonymous' }
      ],
    }
  },
  vite: {
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.API_KEY || process.env.NUXT_PUBLIC_API_KEY || ''),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || process.env.NUXT_PUBLIC_BACKEND_URL || ''),
      'import.meta.env.VITE_COMMENT_BACKEND_URL': JSON.stringify(process.env.COMMENT_BACKEND_URL || process.env.NUXT_PUBLIC_COMMENT_BACKEND_URL || '')
    }
  },
  runtimeConfig: {
    public: {
      BACKEND_URL: process.env.NUXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://meridian.mpanel.app/api/webV3',
      COMMENT_BACKEND_URL: process.env.NUXT_PUBLIC_COMMENT_BACKEND_URL || 'https://meridian.mpanel.app/api/v1/ios',
      API_KEY: process.env.NUXT_PUBLIC_API_KEY || '',
      SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://meridiansport.rs',
      SITE_NAME: process.env.NUXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Meridian Sport',
      SITE_DESCRIPTION: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || process.env.SITE_DESCRIPTION || 'Najnovije sportske vesti, rezultati, prenosi uživo i analize.',
      TWITTER_HANDLE: process.env.NUXT_PUBLIC_TWITTER_HANDLE || process.env.TWITTER_HANDLE || ''
    }
  },
})
