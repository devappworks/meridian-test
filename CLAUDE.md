# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server:**
```bash
npm run dev
```
Starts development server on http://localhost:3000

**Build commands:**
```bash
npm run build          # Build for production (SSR)
npm run generate        # Generate static build
npm run build:static    # Alternative static build
npm run preview         # Preview production build locally
npm run start           # Start production server
```

**Dependencies:**
```bash
npm install
npm run postinstall     # Runs nuxt prepare
```

## Architecture Overview

This is a **Nuxt 4** sports news website with **Server-Side Rendering (SSR)** enabled for all routes. The app is configured for **node-server** deployment.

### Project Structure

- **`app/`** - Main application directory (srcDir configured)
- **`app/pages/`** - File-based routing with Vue pages
- **`app/views/`** - Page view components (HomePage, ArticlePage, etc.)
- **`app/components/`** - Reusable Vue components
- **`app/services/`** - API service layer with axios clients
- **`app/composables/`** - Vue composables
- **`app/middleware/`** - Route middleware
- **`app/layouts/`** - Layout templates

### Key Configuration

**SSR Configuration:**
- All routes use server-side rendering
- Nitro preset: `node-server`
- Routes explicitly configured for SSR in `nuxt.config.ts`

**Environment Variables:**
The app uses multiple environment variable patterns:
- `BACKEND_URL` / `NUXT_PUBLIC_BACKEND_URL`
- `COMMENT_BACKEND_URL` / `NUXT_PUBLIC_COMMENT_BACKEND_URL`
- `API_KEY` / `NUXT_PUBLIC_API_KEY`
- Site configuration (URL, name, description, Twitter handle)

**API Layer:**
- `app/services/api.js` - Centralized API service with axios
- Three clients: `apiClient`, `commentApiClient`, `authApiClient`
- Dynamic authorization header injection
- Handles articles, comments, authentication, user profiles

### Core Technologies

- **Nuxt 4** with Vue 3
- **Axios** for HTTP requests
- **Bootstrap 5.2.3** (CDN)
- **Font Awesome 6.6.0** (CDN)
- **GSAP** for animations
- **Swiper** for sliders
- **jQuery 3.6.0** (CDN)

### Page Types

- **Category pages**: `/fudbal`, `/kosarka`, `/tenis`, `/odbojka`
- **Dynamic routes**: `[slug]`, `[category]/[slug]`, `article/[id]`
- **Special pages**: `/najnovije-vesti`, `/live-blog`, `/moje-vesti`
- **Authentication**: `/prijava`, `/registracija`, `/account-page`
- **Tag system**: `/tag/[tagId]/[tagName]`

### Components Architecture

- **Views**: Main page components that handle data fetching
- **Components**: Reusable UI components (Header, Footer, Sidebar, etc.)
- **Skeletons**: Loading state components in `components/skeletons/`
- **Modals**: SearchModal, CategorySettingsModal

The application follows a sports news portal pattern with comprehensive article management, user authentication, comments system, and live updates functionality.