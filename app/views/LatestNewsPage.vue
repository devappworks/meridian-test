<template>
  <div class="latest-news-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">NAJNOVIJE VESTI</h2>
        </div>

        <!-- Main Latest News Grid -->
        <SkeletonNewsGrid v-if="latestNewsPending || latestNews.length === 0" :columns="4" />
        <NewsGrid v-else sport="NAJNOVIJE" :news="latestNews" />

        <LiveStream />

        <SkeletonNewsGrid v-if="latestNewsPending || loadMoreLatestNews.length === 0" :columns="4" />
        <div v-else>
          <NewsGrid
            sport="NAJNOVIJE"
            :news="loadMoreLatestNews"
            showLoadMore=true
            :loading="isLoading"
            @load-more="loadMore"
          />
          <SkeletonNewsGrid v-if="loading.loadMore" :columns="4" />
        </div>

        <LiveStream />

        <!-- Other News Section -->
        <SkeletonNewsGrid v-if="latestNewsPending || otherNews.length === 0" :columns="4" />
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
            <h3 class="latest">NAJNOVIJE VESTI</h3>
          </div>
          <SkeletonRelatedNews v-if="latestNewsPending || relatedNews.length === 0" />
          <div v-else class="related-news-list">
            <NuxtLink
              v-for="(news, index) in relatedNews"
              :key="news.id"
              :to="`/${news.category}/${news.slug}`"
              class="related-news-item"
            >
              <div class="number">{{ index + 1 }}</div>
              <div class="content">
                <div class="category" :class="getCategoryClass(news.sport)">
                  {{ news.sport }}
                </div>
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
import { fetchFromApi } from "@/services/api";

// Reactive state
const loading = ref({
  featured: false,
  main: false,
  loadMore: false,
  other: false,
  sidebar: false,
});

const latestNews = ref([]);
const loadMoreLatestNews = ref([]);
const otherNews = ref([]);
const relatedNews = ref([]);

const hasMorePages = ref(false);
const currentPage = ref(1);
const isLoading = ref(false);

// Helper functions
const mapArticle = (article) => ({
  id: article.id,
  title: article.title,
  sport: getSportFromCategories(article.categories) || "VESTI",
  date: article.date,
  url: article.url,
  image: article.feat_images["medium"]?.url || null,
  category: article.categories[0]?.slug,
  slug: article.slug,
});

const mapSidebarArticle = (article) => ({
  id: article.id,
  title: article.title,
  sport: getSportFromCategories(article.categories) || "VESTI",
  date: article.date,
  category: article.categories[0].slug,
  slug: article.slug,
});

const getSportFromCategories = (categories) => {
  const sportMap = {
    Fudbal: "FUDBAL",
    Košarka: "KOŠARKA",
    Tenis: "TENIS",
    Odbojka: "ODBOJKA",
  };

  const sportCategory = categories.find((cat) => sportMap[cat.name]);
  return sportCategory ? sportMap[sportCategory.name] : null;
};

const getCategoryClass = (sport) => {
  switch (sport) {
    case "FUDBAL":
      return "football";
    case "KOŠARKA":
      return "basketball";
    case "ODBOJKA":
      return "volleyball";
    case "TENIS":
      return "tennis";
    default:
      return "latest";
  }
};

// SSR Data Fetching
const { data: latestNewsData, pending: latestNewsPending } = await useAsyncData('latest-news-articles', () => 
  fetchFromApi('/getArticles', {
    articleLimit: 53,
    page: 1
  })
);

// Process latest news articles from SSR
if (latestNewsData.value?.result.articles?.length > 0) {
  const articles = latestNewsData.value.result.articles;
  
  // Main latest news grid (first 12 articles)
  latestNews.value = articles.slice(0, 12).map(mapArticle);
  loadMoreLatestNews.value = articles.slice(12, 24).map(mapArticle);
  otherNews.value = articles.slice(24, 48).map(mapArticle);
  relatedNews.value = articles.slice(48, 53).map(mapSidebarArticle);
  
  // Check if we have more pages
  hasMorePages.value = articles.length >= 53;
}

// Client-side functions
const loadMore = async () => {
  if (isLoading.value || !hasMorePages.value) return;
  
  isLoading.value = true;
  const targetCount = 12;
  const collectedArticles = [];
  let currentPageNum = currentPage.value + 1;
  
  try {
    while (collectedArticles.length < targetCount && hasMorePages.value) {
      const response = await fetchFromApi("/getArticles", {
        articleLimit: 12,
        page: currentPageNum,
      });
      
      const allNewArticles = response.result.articles || [];
      if (allNewArticles.length === 0) {
        hasMorePages.value = false;
        break;
      }
      
      // Get all existing URLs to check for duplicates
      const existingUrls = new Set([
        ...latestNews.value.map((article) => article.url),
        ...loadMoreLatestNews.value.map((article) => article.url),
      ]);

      // Filter out any articles that we've already shown
      const uniqueNewArticles = allNewArticles.filter(
        (article) => !existingUrls.has(article.url)
      );
      
      const availableArticles = uniqueNewArticles.map(mapArticle);
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
      loadMoreLatestNews.value = [
        ...loadMoreLatestNews.value,
        ...articlesToAdd
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
</script>

<style scoped>
.section-title {
  font-weight: 600;
  font-size: 28px;
  line-height: 36px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  color: var(--text-white);
  border-left: 4px solid var(--text-white);
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

.related-news-item .category.volleyball {
  color: var(--red-primary);
}

.related-news-item .category.tennis {
  color: var(--blue-primary);
}

.related-news-item .category.latest {
  color: var(--yellow-primary);
}

div.sidebar-header h3.latest {
  color: var(--text-white);
  border-left-color: var(--text-white);
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

.sidebar-header h3.latest {
  color: var(--yellow-primary);
  border-left-color: var(--yellow-primary);
}
</style>
