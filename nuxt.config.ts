// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { config as loadDotenv } from 'dotenv'

// Load environment variables from .env before Nuxt reads them
loadDotenv()

export default defineNuxtConfig({
  // Enable SSR for static generation with content
  ssr: true,
  
  nitro: {
    preset: 'static',
    output: {
      dir: 'dist',        // Build directly to 'dist' folder  
      publicDir: 'dist'   // Put all files in 'dist' (no subdirectories)
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/fudbal',
        '/kosarka', 
        '/tenis',
        '/odbojka',
        '/najnovije-vesti'
      ]
    },
    // Route rules for proper static generation
    routeRules: {
      // Pre-render homepage at build time
      '/': { prerender: true },
      // Pre-render category pages
      '/fudbal/**': { prerender: true },
      '/kosarka/**': { prerender: true },
      '/tenis/**': { prerender: true },
      '/odbojka/**': { prerender: true },
      // Fallback to SPA for other routes
      '/**': { ssr: false }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'stylesheet', integrity: 'sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65', crossorigin: 'anonymous', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js', integrity: 'sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4', crossorigin: 'anonymous', tagPosition: 'bodyClose' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/js/all.min.js', crossorigin: 'anonymous' },
        { src: 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js' }
      ]
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
      SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://meridian-test.mpanel.app',
      SITE_NAME: process.env.NUXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Meridian Sport',
      SITE_DESCRIPTION: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || process.env.SITE_DESCRIPTION || 'Najnovije sportske vesti, rezultati, prenosi uživo i analize.',
      TWITTER_HANDLE: process.env.NUXT_PUBLIC_TWITTER_HANDLE || process.env.TWITTER_HANDLE || ''
    }
  },
})
