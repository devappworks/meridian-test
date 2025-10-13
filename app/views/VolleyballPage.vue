<template>
  <div class="volleyball-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title volleyball">
            ODBOJKA - {{ currentCategoryName }}
          </h2>
        </div>

        <SkeletonFeatured v-if="volleyballPending || !featuredArticle" />
        <FeaturedArticle v-else :article="featuredArticle" />

        <!-- Main Volleyball News Grid -->
        <SkeletonNewsGrid v-if="volleyballPending || volleyballNews.length === 0" :columns="4" :cardCount="16" />
        <NewsGrid v-else sport="ODBOJKA" :news="volleyballNews" />

        <LiveStream />

        <SkeletonNewsGrid v-if="volleyballPending || loadMoreVolleyballNews.length === 0" :columns="4" :cardCount="12" />
        <div v-else>
          <NewsGrid
            sport="ODBOJKA"
            :news="loadMoreVolleyballNews"
            showLoadMore=true
            :loading="isLoading"
            @load-more="loadMore"
          />
          <SkeletonNewsGrid
            v-if="loading.loadMore"
            :columns="4"
            :cardCount="12"
          />
        </div>

        <LiveStream />

        <!-- Other News Section -->
        <SkeletonNewsGrid v-if="volleyballPending || otherNews.length === 0" :columns="4" />
        <NewsGrid
          v-else
          title="OSTALE VESTI"
          sport="OSTALE VESTI"
          :news="otherNews"
          background=true
        />
      </div>

      <!-- Sidebar -->
      <div class="sidebar-column">
        <div class="sidebar-news">
          <div class="sidebar-header">
            <h3 class="volleyball">NAJNOVIJE VESTI</h3>
          </div>
          <SkeletonRelatedNews v-if="volleyballPending || relatedNews.length === 0" />
          <div v-else class="related-news-list">
            <NuxtLink
              v-for="(news, index) in relatedNews"
              :key="news.id"
              :to="`/${news.category}/${news.slug}`"
              class="related-news-item"
            >
              <div class="number">{{ index + 1 }}</div>
              <div class="content">
                <div class="category" :class="getCategoryClass(news.sport)">{{ news.sport }}</div>
                <h3>{{ news.title }}</h3>
                <div class="timestamp">
                  <span>{{ news.date }}</span>
                  <div class="divider"></div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
        <NewsletterForm />
        <AdBanners />
      </div>
    </div>
  </div>
</template>

<script setup>
import NewsletterForm from "@/components/Newsletter.vue";
import AdBanners from "@/components/AdBanners.vue";
import LiveStream from "@/components/LiveStream.vue";
import NewsGrid from "@/components/NewsGrid.vue";
import SkeletonNewsGrid from "@/components/skeletons/SkeletonNewsGrid.vue";
import SkeletonRelatedNews from "@/components/skeletons/SkeletonRelatedNews.vue";
import SkeletonFeatured from "@/components/skeletons/SkeletonFeatured.vue";
import FeaturedArticle from "@/components/Featured.vue";
import { fetchFromApi } from "@/services/api";

// Reactive state
const loading = ref({
  featured: false,
  main: false,
  loadMore: false,
  other: false,
  sidebar: false,
});

const volleyballNews = ref([]);
const loadMoreVolleyballNews = ref([]);
const otherNews = ref([]);
const relatedNews = ref([]);
const featuredArticle = ref(null);

const currentCategory = ref(37);
const mainVolleyballCategory = ref(37);
const volleyballMenuData = ref(null);
const categoryNameMap = ref({});
const hasMorePages = ref(false);
const currentPage = ref(1);
const isLoading = ref(false);
const isSwitchingCategory = ref(false);

// Helper functions
const mapArticle = (article) => ({
  id: article.id,
  title: article.title,
  sport: "ODBOJKA",
  date: article.date,
  url: article.url,
  image: article.feat_images["small"]?.url || null,
  featImages: article.feat_images || null, // Include full feat_images for WebP support
  category: useArticleCategory(article) || article.categories[0].slug,
  slug: article.slug,
});

const mapSidebarArticle = (article) => ({
  id: article.id,
  title: article.title,
  sport: "ODBOJKA",
  date: article.date,
  category: useArticleCategory(article) || article.categories[0].slug,
  slug: article.slug,
});

const buildCategoryArray = () => {
  return currentCategory.value === mainVolleyballCategory.value 
    ? mainVolleyballCategory.value 
    : currentCategory.value;
};

const filterArticlesBySubcategory = (articles) => articles;

const getCategoryClass = (sport) => {
  switch (sport) {
    case "FUDBAL":
      return "football";
    case "KOŠARKA":
      return "basketball";
    case "TENIS":
      return "tennis";
    case "ODBOJKA":
      return "volleyball";
    default:
      return "other";
  }
};

// Computed values  
const currentCategoryName = computed(() => {
  return categoryNameMap.value[currentCategory.value] || "ODBOJKA";
});

// SSR Data Fetching
const { data: webSettings } = await useAsyncData('volleyball-web-settings', () => 
  fetchFromApi('/getWebSettings')
);

const [
  { data: volleyballData, pending: volleyballPending },
  { data: latestArticlesData }
] = await Promise.all([
  useAsyncData('volleyball-articles', () =>
    fetchFromApi('/getArticles', {
      articleLimit: 40,
      'category[]': 37 // Default volleyball category
    })
  ),
  useAsyncData('volleyball-latest-sidebar', () =>
    fetchFromApi('/getArticles', {
      articleLimit: 8
    })
  )
]);

// Process SSR data
if (webSettings.value?.success && webSettings.value.result.languages?.length > 0) {
  const defaultLanguage = webSettings.value.result.languages[0];
  const volleyballMenu = defaultLanguage.web_menu?.find(menu => menu.title === "ODBOJKA");
  
  if (volleyballMenu) {
    volleyballMenuData.value = volleyballMenu;
    
    // Build category mapping
    const categoryMapping = {};
    
    // Map main volleyball category
    if (volleyballMenu.web_categories?.length > 0) {
      const mainCategoryId = volleyballMenu.web_categories[0];
      categoryMapping[mainCategoryId] = "SVE VESTI";
      mainVolleyballCategory.value = mainCategoryId;
      currentCategory.value = mainCategoryId;
    }
    
    // Map subcategories
    if (volleyballMenu.sub_menu?.length > 0) {
      volleyballMenu.sub_menu.forEach(subMenu => {
        if (subMenu.web_categories?.length > 0) {
          categoryMapping[subMenu.web_categories[0]] = subMenu.title;
        }
      });
    }
    
    categoryNameMap.value = categoryMapping;
  }
}

// Process volleyball articles from SSR
if (volleyballData.value?.result.articles?.length > 0) {
  const allArticles = volleyballData.value.result.articles;
  const filteredArticles = filterArticlesBySubcategory(allArticles);
  
  if (filteredArticles.length > 0) {
    // Featured article
    featuredArticle.value = {
      id: filteredArticles[0].id,
      title: filteredArticles[0].title,
      sport: "ODBOJKA",
      date: filteredArticles[0].date,
      url: filteredArticles[0].url,
      image: filteredArticles[0].feat_images["medium"]?.url || null,
      featImages: filteredArticles[0].feat_images || null, // Include full feat_images for WebP support
      content: filteredArticles[0].contents,
      featured: true,
      category: filteredArticles[0].categories[0].slug,
      slug: filteredArticles[0].slug,
    };
    
    // Main news
    volleyballNews.value = filteredArticles.slice(1, 17).map(mapArticle);
    loadMoreVolleyballNews.value = filteredArticles.slice(17, 29).map(mapArticle);
    otherNews.value = filteredArticles.slice(29, 37).map(mapArticle);

    const articlesUsed = 40;
    hasMorePages.value = filteredArticles.length >= articlesUsed;
  }
}

// Process latest articles for sidebar from SSR
if (latestArticlesData.value?.result.articles?.length > 0) {
  const getSportFromCategories = (categories) => {
    const sportMap = {
      Fudbal: "FUDBAL",
      Košarka: "KOŠARKA",
      Tenis: "TENIS",
      Odbojka: "ODBOJKA",
    };
    const sportCategory = categories.find((cat) => sportMap[cat.name]);
    return sportCategory ? sportMap[sportCategory.name] : "OSTALE VESTI";
  };

  relatedNews.value = latestArticlesData.value.result.articles.slice(0, 8).map((article) => ({
    id: article.id,
    title: article.title,
    sport: getSportFromCategories(article.categories),
    date: article.date,
    category: useArticleCategory(article) || article.categories[0].slug,
    slug: article.slug,
  }));
}

// Client-side functions
const switchCategory = async (categoryId) => {
  currentCategory.value = categoryId;
  isSwitchingCategory.value = true;
  
  loading.value = {
    featured: true,
    main: true, 
    loadMore: false,
    other: true,
    sidebar: true,
  };
  
  try {
    const [volleyballDataResponse, latestArticlesResponse] = await Promise.all([
      fetchFromApi("/getArticles", {
        articleLimit: 40,
        "category[]": buildCategoryArray(),
      }),
      fetchFromApi("/getArticles", {
        articleLimit: 8,
      })
    ]);

    const allArticles = volleyballDataResponse.result.articles;
    const filteredArticles = filterArticlesBySubcategory(allArticles);

    if (filteredArticles.length > 0) {
      featuredArticle.value = {
        id: filteredArticles[0].id,
        title: filteredArticles[0].title,
        sport: "ODBOJKA",
        date: filteredArticles[0].date,
        url: filteredArticles[0].url,
        image: filteredArticles[0].feat_images["medium"]?.url || null,
        featImages: filteredArticles[0].feat_images || null, // Include full feat_images for WebP support
        content: filteredArticles[0].contents,
        featured: true,
        category: filteredArticles[0].categories[0].slug,
        slug: filteredArticles[0].slug,
      };

      volleyballNews.value = filteredArticles.slice(1, 17).map(mapArticle);
      loadMoreVolleyballNews.value = filteredArticles.slice(17, 29).map(mapArticle);
      otherNews.value = filteredArticles.slice(29, 37).map(mapArticle);

      const articlesUsed = 40;
      hasMorePages.value = filteredArticles.length >= articlesUsed;
    }

    // Update sidebar with latest articles globally
    if (latestArticlesResponse?.result.articles?.length > 0) {
      const getSportFromCategories = (categories) => {
        const sportMap = {
          Fudbal: "FUDBAL",
          Košarka: "KOŠARKA",
          Tenis: "TENIS",
          Odbojka: "ODBOJKA",
        };
        const sportCategory = categories.find((cat) => sportMap[cat.name]);
        return sportCategory ? sportMap[sportCategory.name] : "OSTALE VESTI";
      };

      relatedNews.value = latestArticlesResponse.result.articles.slice(0, 8).map((article) => ({
        id: article.id,
        title: article.title,
        sport: getSportFromCategories(article.categories),
        date: article.date,
        category: useArticleCategory(article) || article.categories[0].slug,
        slug: article.slug,
      }));
    }
    
    loading.value = {
      featured: false,
      main: false,
      loadMore: false, 
      other: false,
      sidebar: false,
    };
  } catch (error) {
    console.error("Error switching category:", error);
    loading.value = {
      featured: false,
      main: false,
      loadMore: false,
      other: false, 
      sidebar: false,
    };
  } finally {
    isSwitchingCategory.value = false;
  }
  
  // Notify header
  window.dispatchEvent(new CustomEvent("volleyball-category-updated", {
    detail: { categoryId }
  }));
};

const handleGlobalCategoryChange = (event) => {
  const { categoryId } = event.detail;
  switchCategory(categoryId);
};

const loadMore = async () => {
  if (isLoading.value || !hasMorePages.value) return;
  
  isLoading.value = true;
  const targetCount = 12;
  const collectedArticles = [];
  let currentPageNum = currentPage.value + 1;
  
  try {
    while (collectedArticles.length < targetCount && hasMorePages.value) {
      const response = await fetchFromApi("/getArticles", {
        "category[]": buildCategoryArray(),
        page: currentPageNum,
        articleLimit: 12,
      });
      
      const allNewArticles = response.result.articles || [];
      if (allNewArticles.length === 0) {
        hasMorePages.value = false;
        break;
      }
      
      const filteredNewArticles = filterArticlesBySubcategory(allNewArticles);
      const availableArticles = filteredNewArticles.filter(newArticle =>
        !loadMoreVolleyballNews.value.some(existing => existing.id === newArticle.id)
      );
      
      collectedArticles.push(...availableArticles);
      hasMorePages.value = allNewArticles.length >= 12;
      currentPageNum++;
      
      if (currentPageNum > currentPage.value + 10) {
        console.warn("Reached maximum page limit");
        break;
      }
    }
    
    if (collectedArticles.length > 0) {
      const articlesToAdd = collectedArticles.slice(0, targetCount);
      loadMoreVolleyballNews.value = [
        ...loadMoreVolleyballNews.value,
        ...articlesToAdd.map(mapArticle)
      ];
      currentPage.value = currentPageNum - 1;
    } else {
      hasMorePages.value = false;
    }
  } catch (error) {
    console.error("Error loading more articles:", error);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  // Listen for the event using the sport key that matches what Header emits
  // Header uses the sport key "odbojka" (lowercase slug), not "volleyball"
  window.addEventListener("odbojka-category-changed", handleGlobalCategoryChange);
  
  window.dispatchEvent(new CustomEvent("volleyball-category-updated", {
    detail: { categoryId: currentCategory.value }
  }));
});

onBeforeUnmount(() => {
  window.removeEventListener("odbojka-category-changed", handleGlobalCategoryChange);
});
</script>

<style scoped>
.section-title {
  font-weight: 600;
  font-size: 28px;
  line-height: 36px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  color: var(--red-primary);
  border-left: 4px solid var(--red-primary);
  padding-left: 12px;
}

.related-news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--dark-gradient);
  border-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  padding: 12px 24px 12px 8px;
  margin-bottom: 20px;
  border: 1px solid var(--bg-50);
  border-right: none;
}

.related-news-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  color: inherit;
}

.related-news-item:hover {
  transform: translateX(4px);
}

.number {
  font-family: var(--urbanist);
  font-size: 50px;
  line-height: 96px;
  color: var(--text-white);
  min-width: 45px;
  text-align: center;
}

.related-news-item .category {
  font-weight: 700;
  font-size: 15px;
  line-height: 19px;
  margin-bottom: 8px;
}

.related-news-item .category.football {
  color: var(--green-primary);
}

.related-news-item .category.basketball {
  color: var(--orange-primary);
}

.related-news-item .category.tennis {
  color: var(--blue-primary);
}

.related-news-item .category.volleyball {
  color: var(--red-primary);
}

.related-news-item .category.other {
  color: var(--yellow-primary);
}

.related-news-item h3 {
  font-family: var(--title);
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: var(--text-white);
  margin: 0 0 10px 0;
}

.timestamp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  color: var(--text-25);
  font-size: 15px;
}

.divider {
  flex-grow: 1;
  height: 1px;
  background: var(--bg-40);
}

.content {
  width: 100%;
}

.sidebar-header h3 {
  font-size: 24px;
  border-left: 4px solid var(--text-white);
  padding-left: 12px;
  margin-bottom: 16px;
}

.sidebar-header h3.volleyball {
  color: var(--red-primary);
  border-left-color: var(--red-primary);
}
</style>
