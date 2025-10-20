<script setup>
// Critical above-the-fold components - loaded immediately
import FeaturedArticle from "@/components/Featured.vue";
import NewsGrid from "@/components/NewsGrid.vue";
import NewsSidebar from "@/components/Sidebar.vue";
import AdBanners from "@/components/AdBanners.vue";

// Below-the-fold components - lazy loaded to improve LCP
const NewsSlider = defineAsyncComponent(() => import("@/components/NewsSlider.vue"));
const LiveStream = defineAsyncComponent(() => import("@/components/LiveStream.vue"));
const YouTubeSection = defineAsyncComponent(() => import("@/components/YouTube.vue"));
const NewsletterForm = defineAsyncComponent(() => import("@/components/Newsletter.vue"));

import { fetchFromApi, fetchMeridianTipovi } from "@/services/api";
import { getCanonicalCategoryFromSlug } from '~/utils/canonicalCategory';

// Import skeleton components
import SkeletonFeatured from "@/components/skeletons/SkeletonFeatured.vue";
import SkeletonNewsGrid from "@/components/skeletons/SkeletonNewsGrid.vue";
import SkeletonNewsSlider from "@/components/skeletons/SkeletonNewsSlider.vue";
import SkeletonSidebar from "@/components/skeletons/SkeletonSidebar.vue";

// SEO and Meta setup
const config = useRuntimeConfig();

function stripHtml(input) {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const siteUrl = (config.public?.SITE_URL || "").replace(/\/$/, "");
const siteName = config.public?.SITE_NAME || "Meridian Sport";
const siteDescription = config.public?.SITE_DESCRIPTION || "";
const twitterHandle = config.public?.TWITTER_HANDLE || "";
const canonicalUrl = siteUrl ? `${siteUrl}/` : undefined;

// SEO-optimized title and description with keywords
const title = "Meridian Sport - Najnovije Sportske Vesti | Srbija";
const description = stripHtml(siteDescription) || "Sve sportske vesti na jednom mestu – fudbal, košarka, tenis i još mnogo toga. Meridian Sport donosi najbrže informacije i analize.";
const imageUrl = siteUrl ? `${siteUrl}/images/homepage-og.jpg` : undefined;

const ld = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: canonicalUrl,
  logo: {
    "@type": "ImageObject",
    "@id": `${siteUrl}/#logo`,
    url: "https://meridiansport.rs/images/meridian-favicon-512x512.png",
    contentUrl: "https://meridiansport.rs/images/meridian-favicon-512x512.png",
    caption: siteName,
    inLanguage: "sr-RS",
    width: 512,
    height: 512
  },
  sameAs: [
    "https://www.facebook.com/sportmeridian",
    "https://www.instagram.com/meridiansportrs",
    "https://www.youtube.com/@meridiansport",
    "https://twitter.com/meridiansportrs"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+381 11 344 11 86",
    contactType: "customer support"
  },
  location: {
    "@type": "Place",
    "@id": `${siteUrl}/#place`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kneza Miloša 7",
      addressLocality: "Beograd",
      postalCode: "11000",
      addressCountry: {
        "@type": "Country",
        name: "Srbija"
      }
    }
  }
};

const ld2 = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteName,
  description: description || "Najnovije sportske vesti, rezultati, prenosi uživo i analize.",
  inLanguage: "sr-RS",
  publisher: {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#logo`,
      url: "https://meridiansport.rs/images/meridian-favicon-512x512.png",
      contentUrl: "https://meridiansport.rs/images/meridian-favicon-512x512.png",
      caption: siteName,
      inLanguage: "sr-RS",
      width: 512,
      height: 512
    },
    sameAs: [
      "https://www.facebook.com/sportmeridian",
      "https://www.instagram.com/meridiansportrs",
      "https://www.youtube.com/@meridiansport",
      "https://twitter.com/meridiansportrs"
    ]
  },
  sameAs: [
    "https://meridiansport.rs/feed.xml"
  ],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
}

useHead(() => ({
  title,
  meta: [
    { key: "description", name: "description", content: description },
    { key: "keywords", name: "keywords", content: "sportske vesti, fudbal, košarka, partizan, zvezda, ponovo, vesti, tenis, odbojka, sport srbija, rezultati uživo, transfer vesti, sportski portal" },
    { key: "robots", name: "robots", content: "index, follow, max-image-preview:large" },
    // Open Graph
    { key: "og:type", property: "og:type", content: "website" },
    { key: "og:site_name", property: "og:site_name", content: siteName },
    { key: "og:title", property: "og:title", content: title },
    { key: "og:description", property: "og:description", content: description },
    canonicalUrl ? { key: "og:url", property: "og:url", content: canonicalUrl } : null,
    imageUrl ? { key: "og:image", property: "og:image", content: imageUrl } : null,
    // Twitter
    { key: "twitter:card", name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
    twitterHandle ? { key: "twitter:site", name: "twitter:site", content: twitterHandle } : null,
    { key: "twitter:title", name: "twitter:title", content: title },
    { key: "twitter:description", name: "twitter:description", content: description },
    imageUrl ? { key: "twitter:image", name: "twitter:image", content: imageUrl } : null,
  ].filter(Boolean),
  link: [
    canonicalUrl ? { rel: "canonical", href: canonicalUrl } : null,
    { rel: "alternate", type: "application/rss+xml", title: "Meridian Sport RSS", href: "https://meridiansport.rs/feed.xml" }
  ].filter(Boolean),
  script: [
    {
      key: "ldjson-website-1",
      type: "application/ld+json",
      innerHTML: JSON.stringify(ld),
    },
    {
      key: "ldjson-website-2",
      type: "application/ld+json",
      innerHTML: JSON.stringify(ld2),
    },
  ],
}));

// Reactive state
const loading = ref({
  matches: false,
  featured: false,
  latestGrid: false,
  football: false,
  basketball: false,
  tennis: false,
  other: false,
  sidebar: false,
});

const featuredArticle = ref(null);
const latestNewsGrid = ref([]);
const latestNews = ref([]);
const footballNews = ref([]);
const basketballNews = ref([]);
const tennisNews = ref([]);
const volleyballNews = ref([]);
const otherNews = ref([]);
const tipovi = ref([]);

const matches = ref([
  {
    date: "03.02. 16:00",
    homeTeam: "Manchester United",
    awayTeam: "Wolverhampton Wanderers",
    odds: ["1.32", "1.32", "1.32"],
  },
  {
    date: "03.02. 16:00",
    homeTeam: "Manchester United",
    awayTeam: "Wolverhampton Wanderers",
    odds: ["1.32", "1.32", "1.32"],
  },
  {
    date: "03.02. 16:00",
    homeTeam: "Manchester United",
    awayTeam: "Wolverhampton Wanderers",
    odds: ["1.32", "1.32", "1.32"],
  },
  {
    date: "03.02. 16:00",
    homeTeam: "Manchester United",
    awayTeam: "Wolverhampton Wanderers",
    odds: ["1.32", "1.32", "1.32"],
  },
]);

// Helper functions
const mapArticleData = (article) => {
  if (!article) {
    return null;
  }

  // Handle missing categories gracefully - use default category
  const hasCategories = article.categories && Array.isArray(article.categories) && article.categories.length > 0;
  const defaultCategory = 'ostali-sportovi'; // Default category for articles without category

  if (!hasCategories) {
    console.warn('Article without category detected:', article.id, article.title);
  }

  return {
    id: article.id,
    title: article.title,
    sport: hasCategories ? getSportFromCategories(article.categories) : 'OSTALE VESTI',
    date: article.date,
    url: article.url,
    image: article.feat_images?.["small"]?.url || null,
    featImages: article.feat_images || null, // Include full feat_images for WebP support
    category: hasCategories ? (article.categories[0]?.slug || defaultCategory) : defaultCategory,
    slug: article.slug || '',
  };
};

const getSportFromCategories = (categories) => {
  const sportMap = {
    Fudbal: "FUDBAL",
    Košarka: "KOŠARKA", 
    Tenis: "TENIS",
    Odbojka: "ODBOJKA",
    "Meridian tipovi": "TIPOVI"
  };

  const sportCategory = categories.find((cat) => sportMap[cat.name]);
  return sportCategory ? sportMap[sportCategory.name] : "OSTALE VESTI";
};

const sportClass = (sport) => {
  const sportMap = {
    FUDBAL: "football",
    KOŠARKA: "basketball",
    TENIS: "tennis",
    ODBOJKA: "volleyball",
    TIPOVI: "tipovi",
  };
  return sportMap[sport] || "";
};

// SSR Data Fetching with Global Caching (persists across page navigations)
const cache = useGlobalCache()

const { data: featuredData, pending: featuredPending } = await useAsyncData('homepage-featured', async () => {
  return await cache.fetchWithCache(
    'homepage-featured',
    async () => {
      console.log('🔥 FETCHING Homepage Featured Articles from API')
      const data = await fetchFromApi('/getHomepageFeaturedArticles');
      console.log('✅ Featured articles loaded:', data.result?.articles?.length)
      return data;
    },
    1000 * 60 // Cache for 60 seconds
  )
});

const { data: latestArticlesData, pending: latestPending } = await useAsyncData('homepage-latest', async () => {
  return await cache.fetchWithCache(
    'homepage-latest',
    async () => {
      console.log('🔥 FETCHING Homepage Latest Articles from API')
      return await fetchFromApi('/getArticles')
    },
    1000 * 60 // Cache for 60 seconds
  )
});

const [
  //{ data: tennisData },
  { data: volleyballData },
  { data: basketballData },
  { data: footballData },
  { data: tipoviData }
] = await Promise.all([
  //useAsyncData('homepage-tennis', () => fetchFromApi('/getArticles', { articleLimit: 20, 'category[]': 41 }), { staleTime: 1000 * 60 }),
  useAsyncData('homepage-volleyball', () => fetchFromApi('/getArticles', { articleLimit: 12, 'category[]': 37 }), { staleTime: 1000 * 60 }), // Cache for 60 seconds
  useAsyncData('homepage-basketball', () => fetchFromApi('/getArticles', { articleLimit: 12, 'category[]': 25 }), { staleTime: 1000 * 60 }), // Cache for 60 seconds
  useAsyncData('homepage-football', () => fetchFromApi('/getArticles', { articleLimit: 8, 'category[]': 28 }), { staleTime: 1000 * 60 }), // Cache for 60 seconds
  useAsyncData('homepage-tipovi', () => fetchMeridianTipovi(3), { staleTime: 1000 * 30 }) // Cache for 30 seconds (more dynamic content)
]);

// Process featured articles from SSR
if (featuredData.value?.result.articles?.length > 0) {
  const featuredArticles = featuredData.value.result.articles.filter(article => article); // Only filter out null/undefined

  if (featuredArticles.length > 0) {
    const firstArticle = featuredArticles[0];
    const hasCategories = firstArticle.categories && Array.isArray(firstArticle.categories) && firstArticle.categories.length > 0;
    const defaultCategory = 'ostali-sportovi';

    if (!hasCategories) {
      console.warn('Featured article without category detected:', firstArticle.id, firstArticle.title);
    }

    featuredArticle.value = {
      id: firstArticle.id,
      title: firstArticle.title,
      sport: hasCategories ? getSportFromCategories(firstArticle.categories) : 'OSTALE VESTI',
      date: firstArticle.date,
      url: firstArticle.url,
      image: firstArticle.feat_images?.["medium"]?.url || null,
      featImages: firstArticle.feat_images || null,
      content: firstArticle.contents,
      category: hasCategories ? (firstArticle.categories?.[0]?.slug || defaultCategory) : defaultCategory,
      slug: firstArticle.slug || '',
    };

    // Preload featured image for better LCP
    if (featuredArticle.value.image) {
      const webpUrl = featuredArticle.value.featImages?.['extra-large']?.webp || null;
      useImagePreload(featuredArticle.value.image, webpUrl);
    }

    latestNewsGrid.value = featuredArticles.slice(1, featuredArticles.length).map(mapArticleData).filter(Boolean);
  }
}

// Process latest articles from SSR
if (latestArticlesData.value?.result.articles?.length > 0) {
  const articles = latestArticlesData.value.result.articles;
  
  latestNews.value = articles.slice(0, 8).map((article) => ({
    id: article.id,
    title: article.title,
    sport: getSportFromCategories(article.categories),
    date: article.date,
    url: article.url,
    image: article.feat_images["thumb"]?.url || null,
    featImages: article.feat_images || null,
    category: article.categories[0]?.slug,
    slug: article?.slug,
  }));
  
  otherNews.value = articles.slice(8, 16).map(mapArticleData);
}

// Process sport-specific articles from SSR
if (footballData.value?.result.articles?.length > 0) {
  footballNews.value = footballData.value.result.articles.slice(0, 8).map((article) => ({
    id: article.id,
    title: article.title,
    sport: "FUDBAL",
    date: article.date,
    url: article.url,
    image: article.feat_images["small"]?.url || null,
    featImages: article.feat_images || null,
    category: article.categories[0]?.slug,
    slug: article?.slug,
  }));
}

if (volleyballData.value?.result.articles?.length > 0) {
  volleyballNews.value = volleyballData.value.result.articles.slice(0, 12).map((article) => ({
    id: article.id,
    title: article.title,
    sport: "ODBOJKA",
    date: article.date,
    url: article.url,
    image: article.feat_images["small"]?.url || null,
    featImages: article.feat_images || null,
    category: article.categories[0]?.slug,
    slug: article?.slug,
  }));
}

if (basketballData.value?.result.articles?.length > 0) {
  basketballNews.value = basketballData.value.result.articles.slice(0, 12).map((article) => ({
    id: article.id,
    title: article.title,
    sport: "KOŠARKA",
    date: article.date,
    url: article.url,
    image: article.feat_images["small"]?.url || null,
    featImages: article.feat_images || null,
    category: article.categories[0]?.slug,
    slug: article?.slug,
  }));
}

/* if (tennisData.value?.result.articles?.length > 0) {
  tennisNews.value = tennisData.value.result.articles.slice(0, 12).map((article) => ({
    id: article.id,
    title: article.title,
    sport: "TENIS",
    date: article.date,
    url: article.url,
    image: article.feat_images["small"]?.url || null,
    featImages: article.feat_images || null,
    category: article.categories[0]?.slug,
    slug: article?.slug,
  }));
} */

// Process Meridian tipovi articles from SSR
if (tipoviData.value?.result.articles?.length > 0) {
  tipovi.value = tipoviData.value.result.articles.slice(0, 3).map((article) => ({
    id: article.id,
    title: article.title,
    sport: getSportFromCategories(article.categories),
    time: article.date,
    url: article.url,
    category: article.categories[0]?.slug,
    slug: article?.slug,
  }));
}

// Compute pending states for template
const homepagePending = computed(() => {
  return featuredPending.value || latestPending.value;
});

// Set matches loading state timeout (since they're static)
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const currentSlide = ref(0);

onMounted(() => {
  setTimeout(() => {
    loading.value.matches = false;
  }, 500);
});

// Client-side functions for match odds slider
/* const startDragging = (e) => {
  isDragging.value = true;
  const slider = document.querySelector('.match-odds-container');
  startX.value = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
  scrollLeft.value = slider.scrollLeft;
  slider.style.cursor = "grabbing";
  slider.style.userSelect = "none";
};

const drag = (e) => {
  if (!isDragging.value) return;
  e.preventDefault();
  const slider = document.querySelector('.match-odds-container');
  const x = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
  const walk = (x - startX.value) * 2;
  slider.scrollLeft = scrollLeft.value - walk;
};

const stopDragging = () => {
  isDragging.value = false;
  const slider = document.querySelector('.match-odds-container');
  slider.style.cursor = "grab";
  slider.style.removeProperty("user-select");

  // Snap to closest item
  const itemWidth = slider.querySelector(".match-odds").offsetWidth + 8; // 8px is the gap
  const scrollPosition = slider.scrollLeft;
  const nearestItem = Math.round(scrollPosition / itemWidth);

  slider.scrollTo({
    left: nearestItem * itemWidth,
    behavior: "smooth",
  });
};

const slideMatchOdds = (direction) => {
  const slider = document.querySelector('.match-odds-container');
  const itemWidth = slider.querySelector(".match-odds").offsetWidth + 8; // 8px is the gap

  if (direction === "next") {
    slider.scrollBy({ left: itemWidth, behavior: "smooth" });
  } else {
    slider.scrollBy({ left: -itemWidth, behavior: "smooth" });
  }
}; */
</script>

<template>
  <div class="content-wrapper">
    <!-- SEO: Add hidden H1 for homepage with all important keywords -->
    <h1 class="visually-hidden">Meridian Sport - Najnovije Sportske Vesti: Fudbal, Košarka, Partizan, Ponovo iz Srbije i Sveta</h1>
    
    <!-- Match odds section with Loading State -->
    <!-- <SkeletonMatchOdds v-if="loading.matches" />
    <MatchOddsSlider v-else :matches="matches" /> -->
    <!-- End of match odds section -->
    <div class="main-column">
      <!-- Featured Article with Loading State -->
      <SkeletonFeatured v-if="homepagePending || !featuredArticle" />
      <FeaturedArticle v-else :article="featuredArticle" />

      <!-- Latest News Grid with Loading State -->
      <SkeletonNewsGrid v-if="homepagePending || latestNewsGrid.length === 0" />
      <NewsGrid v-else :news="latestNewsGrid" />

      <LiveStream />

      <!-- Football News with Loading State -->
      <SkeletonNewsGrid v-if="homepagePending || footballNews.length === 0" title="FUDBAL" sport="FUDBAL" />
      <NewsGrid v-else title="FUDBAL" sport="FUDBAL" :news="footballNews" />

      <!-- Basketball News with Loading State -->
      <SkeletonNewsSlider
        v-if="homepagePending || basketballNews.length === 0"
        title="KOŠARKA"
        sport="KOŠARKA"
      />
      <NewsSlider
        v-else
        title="KOŠARKA"
        sport="KOŠARKA"
        :news="basketballNews"
      />

      <!-- Tennis News with Loading State -->
      <!-- <SkeletonNewsSlider v-if="homepagePending || tennisNews.length === 0" title="TENIS" sport="TENIS" />
      <NewsSlider v-else title="TENIS" sport="TENIS" :news="tennisNews" /> -->

      <!-- Volleyball News with Loading State -->
      <SkeletonNewsSlider v-if="homepagePending || volleyballNews.length === 0" title="ODBOJKA" sport="ODBOJKA" />
      <NewsSlider v-else title="ODBOJKA" sport="ODBOJKA" :news="volleyballNews" />

      <YouTubeSection />

      <!-- Other News with Loading State -->
      <SkeletonNewsGrid
        v-if="homepagePending || otherNews.length === 0"
        title="OSTALE VESTI"
        sport="OSTALE VESTI"
      />
      <NewsGrid
        v-else
        title="OSTALE VESTI"
        sport="OSTALE VESTI"
        :news="otherNews"
        :background=true
      />
    </div>

    <div class="sidebar-column">
      <div class="sidebar-news">
        <div class="sidebar-header">
          <h2>NAJNOVIJE VESTI</h2>
          <NuxtLink to="/najnovije-vesti/" class="see-all">Sve vesti</NuxtLink>
        </div>
        <!-- Sidebar News with Loading State -->
        <SkeletonSidebar v-if="homepagePending || latestNews.length === 0" />
        <NewsSidebar v-else :latestNews="latestNews" />
      </div>

      <NewsletterForm />

      <div class="tipovi-dana">
        <div>
          <h2 class="tipovi-title">TIPOVI DANA</h2>
          <div class="tipovi-content">
            <NuxtLink
              v-for="(item, index) in tipovi"
              :key="`tip-${index}`"
              :to="`/${getCanonicalCategoryFromSlug(item.category)}/${item.slug}`"
              class="tip-item"
            >
              <div class="tip-category" :class="sportClass(item.sport)">
                <span>{{ item.sport }}</span>
              </div>
              <div class="tip-headline">
                <p>{{ item.title }}</p>
              </div>
              <div class="tip-time">
                <span>{{ item.time }}</span>
                <div class="divider"></div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
      <AdBanners />
    </div>
  </div>
</template>



<style scoped>
.main-column {
  flex: 1;
  min-width: 0; /* Prevents flex items from overflowing */
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
  margin-bottom: 16px;
}

.sidebar-column {
  width: 346px;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
}

.sidebar-header h2 {
  color: var(--text-white);
  font-size: 18px;
  text-transform: uppercase;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid var(--text-white);
}

/* Visually hidden class for SEO H1 */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.see-all {
  color: var(--text-white);
  text-decoration: underline;
}

.tipovi-dana {
  margin-top: 20px;
}

.tipovi-title {
  display: flex;
  width: 100%;
  height: 44px;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  background-color: var(--yellow-primary);
  border: 1px solid var(--bg-40);
  border-radius: 8px;
  color: var(--text-100);
}

.tipovi-content {
  padding: 16px;
  background-color: var(--bg-70);
  border: 1px solid var(--bg-40);
  border-radius: 8px;
  margin-top: 12px;
}

.tip-item {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
}

.tip-item:hover {
  transform: translateY(-2px);
}

.tip-item:not(:last-child) {
  margin-bottom: 32px;
}

.tip-category {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.tip-category.football {
  color: var(--green-primary);
}

.tip-category.basketball {
  color: var(--orange-primary);
}

.tip-category.tennis {
  color: var(--blue-primary);
}

.tip-category.tipovi {
  color: var(--yellow-primary);
}

.tip-headline p {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-white);
  margin: 8px 0;
}

.tip-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-time span {
  font-size: 15px;
  color: var(--text-25);
  font-weight: 400;
}

.divider {
  flex-grow: 1;
  height: 0;
  border-top: 1px solid var(--bg-40);
  margin: 0 8px;
}

.match-odds-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.match-odds-container {
  display: flex;
  align-items: center;
  background: var(--vertical-dark-gradient);
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  padding: 16px 32px;
  cursor: grab;
  user-select: none;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.match-odds-container:active {
  cursor: grabbing;
}

.match-odds-container::-webkit-scrollbar {
  display: none;
}

.match-odds {
  flex: 0 0 auto;
  min-width: 300px;
  max-width: 600px;
  background: linear-gradient(
      180.02deg,
      rgba(0, 0, 0, 0.54) 20.01%,
      rgba(0, 0, 0, 0.6) 73.07%
    ),
    url("../assets/images/odds-background.jpg");
  background-size: cover;
  background-position: center;
  border: 1px solid var(--bg-50);
  border-radius: 4px;
  gap: 16px;
}

.match-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0px;
  gap: 4px;
  width: 170px;
  min-height: 100%;
  padding-left: 6px;
}

.match-date {
  font-family: var(--sport-category-tags);
  font-weight: 400;
  font-size: 11px;
  line-height: 16px;
  color: var(--text-white);
  opacity: 0.9;
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-white);
}

.odds-container {
  display: flex;
  align-items: center;
  margin: auto;
  background: rgba(22, 35, 42, 0.8);
  backdrop-filter: blur(1px);
  border-radius: 4px;
  flex: 1;
  height: calc(100% - 16px);
  margin: 8px;
}

.odds-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  height: 74px;
  padding: 8px;
  flex: 1;
}

.odds-value {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 16px;
  line-height: 10px;
  text-align: center;
  color: var(--text-white);
}

.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--bg-50);
  color: var(--text-white);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  z-index: 1;
}

.slider-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.slider-nav.prev {
  left: 4px;
}

.slider-nav.next {
  right: 4px;
}

.news-grid:last-child {
  background: var(--vertical-dark-gradient);
}

@media screen and (min-width: 1296px) {
  .match-odds-container {
    justify-content: center;
    flex-wrap: wrap;
    overflow-x: visible;
    cursor: default;
  }

  .slider-nav {
    display: none;
  }
}

@media screen and (max-width: 1024px) {
  .sidebar-column {
    width: 100%;
  }

  .sidebar-column div.newsletter {
    align-self: end;
  }
}

@media screen and (max-width: 576px) {
  .sidebar-column > * {
    width: 100%;
  }

  .ad-banners-container div.ad-section {
    flex-direction: column;
  }

  .sidebar-column div.ad-banners-container {
    width: 100%;
  }
}
</style>
