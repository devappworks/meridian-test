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
    viewTransition: true
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
    routeRules: {
      // Proxy sitemap requests to backend server
      '/sitemap.xml': { proxy: 'https://meridian.mpanel.app/sitemap.xml' },
      '/page-sitemap.xml': { proxy: 'https://meridian.mpanel.app/page-sitemap.xml' },
      '/category-sitemap.xml': { proxy: 'https://meridian.mpanel.app/category-sitemap.xml' },
      '/post-sitemap-2025.xml': { proxy: 'https://meridian.mpanel.app/post-sitemap-2025.xml' },
      '/post-sitemap-2024.xml': { proxy: 'https://meridian.mpanel.app/post-sitemap-2024.xml' },
      '/post-sitemap-2023.xml': { proxy: 'https://meridian.mpanel.app/post-sitemap-2023.xml' },
      '/post-sitemap-2022.xml': { proxy: 'https://meridian.mpanel.app/post-sitemap-2022.xml' },
      '/post-sitemap-2021.xml': { proxy: 'https://meridian.mpanel.app/post-sitemap-2021.xml' },
      '/post-sitemap-2020.xml': { proxy: 'https://meridian.mpanel.app/post-sitemap-2020.xml' },
      // Enable SSR for all main routes with caching
      '/': { ssr: true, swr: 60 }, // Cache for 60 seconds
      '/fudbal': { ssr: true, swr: 60 },
      '/kosarka': { ssr: true, swr: 60 },
      '/tenis': { ssr: true, swr: 60 },
      '/najnovije-vesti': { ssr: true, swr: 60 },
      '/odbojka': { ssr: true, swr: 60 },
      '/ostali-sportovi': { ssr: true, swr: 60 },
      // Cache static assets for 1 year
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/images/**': { headers: { 'cache-control': 'public, max-age=2592000' } }, // 30 days
      // Cache public assets (fonts, images, etc)
      '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
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
        // Google Analytics 4 (GA4) - async to prevent render blocking
        // FIXED: Use only 'async' (not both async and defer which causes conflicts)
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
          async: true
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', {
            send_page_view: true,
            cookie_flags: 'SameSite=None;Secure',
            anonymize_ip: true
          });`,
          type: 'text/javascript'
        },
        // Bootstrap and jQuery - deferred to prevent render blocking
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js',
          integrity: 'sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4',
          crossorigin: 'anonymous',
          tagPosition: 'bodyClose',
          defer: true
        },
        {
          src: 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
          tagPosition: 'bodyClose',
          defer: true
        }
      ],
      link: [
        // Favicon - Multiple sizes for better device support
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://meridian.mpanel.app/image/cache/original/files/images/meridian-favicon-1758622126.png?crop=true' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://meridian.mpanel.app/image/cache/original/files/images/meridian-favicon-1758622126.png?crop=true' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://meridian.mpanel.app/image/cache/original/files/images/meridian-favicon-1758622126.png?crop=true' },
        { rel: 'shortcut icon', href: 'https://meridian.mpanel.app/image/cache/original/files/images/meridian-favicon-1758622126.png?crop=true' },
        // Preconnect to ONLY the most critical origins (max 4 for optimal performance)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://meridian.mpanel.app' },
        { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
        // DNS prefetch for less critical origins
        { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
        // Preload critical CSS with high priority
        { rel: 'preload', as: 'style', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css' },
        { rel: 'preload', as: 'style', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css' },
        // Load stylesheets with media="print" onload trick for non-critical CSS
        {
          rel: 'stylesheet',
          integrity: 'sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65',
          crossorigin: 'anonymous',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css'
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
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
    },
    build: {
      // Minify HTML in production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production'
        },
        format: {
          comments: false  // Remove comments from production build
        }
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000
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
      TWITTER_HANDLE: process.env.NUXT_PUBLIC_TWITTER_HANDLE || process.env.TWITTER_HANDLE || '',
      GA_MEASUREMENT_ID: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-D36YF7TZJF'
    }
  },
})