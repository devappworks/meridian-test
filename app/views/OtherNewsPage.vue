<template>
  <div class="other-news-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">OSTALE VESTI</h2>
        </div>

        <!-- Main Other News Grid -->
        <SkeletonNewsGrid v-if="otherPending || otherNews.length === 0" :columns="4" />
        <NewsGrid v-else sport="OSTALE VESTI" :news="otherNews" />

        <LiveStream />

        <SkeletonNewsGrid v-if="otherPending || loadMoreOtherNews.length === 0" :columns="4" />
        <div v-else>
          <NewsGrid
            sport="OSTALE VESTI"
            :news="loadMoreOtherNews"
            showLoadMore=true
            :loading="isLoading"
            @load-more="loadMore"
          />
          <SkeletonNewsGrid v-if="loading.loadMore" :columns="4" />
        </div>

        <LiveStream />

        <!-- Additional News Section -->
        <SkeletonNewsGrid v-if="otherPending || additionalNews.length === 0" :columns="4" />
        <NewsGrid
          v-else
          title="DODATNE VESTI"
          sport="OSTALE VESTI"
          :news="additionalNews"
          background=true
        />
      </div>

      <!-- Sidebar -->
      <div class="sidebar-column">
        <div class="sidebar-news">
          <div class="sidebar-header">
            <h3 class="other">NAJNOVIJE VESTI</h3>
          </div>

          <!-- Related news skeleton -->
          <SkeletonRelatedNews v-if="otherPending || relatedNews.length === 0" />
          <div v-else class="related-news-list">
            <NuxtLink
              v-for="(news, index) in relatedNews"
              :key="news.id"
              :to="`/${news.category}/${news.slug}`"
              class="related-news-item"
            >
              <div class="number">{{ index + 1 }}</div>
              <div class="content">
                <div class="category other">OSTALE VESTI</div>
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
  main: true,
  loadMore: false,
  other: true,
  sidebar: true,
});

const otherNews = ref([]);
const loadMoreOtherNews = ref([]);
const additionalNews = ref([]);
const relatedNews = ref([]);
const currentPage = ref(1);
const isLoading = ref(false);
const hasMorePages = ref(true);

// Helper functions
const mapArticle = (article) => ({
  id: article.id,
  title: article.title,
  sport: "OSTALE VESTI",
  date: article.date,
  url: article.url,
  image: article.feat_images["medium"]?.url || null,
  category: article.categories[0]?.slug,
  slug: article.slug,
});

const mapSidebarArticle = (article) => ({
  id: article.id,
  title: article.title,
  sport: "OSTALE VESTI",
  date: article.date,
  category: article.categories[0]?.slug,
  slug: article.slug,
});

const filterOutSportsArticles = (articles) => {
  // Option 1: Filter out sports articles (uncomment the next two lines)
  // const sportsCategories = [28, 25, 24, 26]; // Football, Basketball, Volleyball, Tennis
  // return articles.filter(article => !sportsCategories.includes(article.category_id));

  // Option 2: Return all articles (current approach)
  return articles;
};

// SSR Data Fetching
const { data: otherData, pending: otherPending } = await useAsyncData('other-news-articles', () => 
  fetchFromApi('/getArticles', {
    articleLimit: 53,
    page: 1
  })
);

// Process other news articles from SSR
if (otherData.value?.result.articles?.length > 0) {
  const articles = otherData.value.result.articles;
  const filteredArticles = filterOutSportsArticles(articles);
  
  if (filteredArticles.length > 0) {
    // Main other news grid (first 12 articles)
    otherNews.value = filteredArticles.slice(0, 12).map(mapArticle);
    loadMoreOtherNews.value = filteredArticles.slice(12, 24).map(mapArticle);
    additionalNews.value = filteredArticles.slice(24, 48).map(mapArticle);
    relatedNews.value = filteredArticles.slice(48, 53).map(mapSidebarArticle);
    
    // Check if we have more pages
    hasMorePages.value = filteredArticles.length >= 53;
  }
}

// Client-side functions
const loadMore = async () => {
  if (isLoading.value || !hasMorePages.value) return;

  isLoading.value = true;
  loading.value.loadMore = true;

  try {
    let foundNewArticles = false;
    let currentPageNum = currentPage.value + 1;

    // Keep trying pages until we find unique articles or run out of pages
    while (!foundNewArticles && hasMorePages.value) {
      const response = await fetchFromApi("/getArticles", {
        articleLimit: 12,
        page: currentPageNum,
      });

      const newArticles = response.result.articles || [];

      if (newArticles.length > 0) {
        // Get all existing URLs to check for duplicates
        const existingUrls = new Set([
          ...otherNews.value.map((article) => article.url),
          ...loadMoreOtherNews.value.map((article) => article.url),
        ]);

        // Filter out any articles that we've already shown
        const uniqueNewArticles = newArticles.filter(
          (article) => !existingUrls.has(article.url)
        );

        const mappedArticles = uniqueNewArticles.map(mapArticle);

        if (mappedArticles.length > 0) {
          // Found unique articles, add them and exit the loop
          loadMoreOtherNews.value = [
            ...loadMoreOtherNews.value,
            ...mappedArticles,
          ];
          currentPage.value = currentPageNum;
          hasMorePages.value = newArticles.length >= 12;
          foundNewArticles = true;
        } else {
          // All articles were duplicates, try the next page
          currentPageNum++;
          hasMorePages.value = newArticles.length >= 12;
        }
      } else {
        hasMorePages.value = false;
      }
    }
    
    if (!foundNewArticles) {
      hasMorePages.value = false;
    }
  } catch (error) {
    console.error("Error loading more articles:", error);
  } finally {
    isLoading.value = false;
    loading.value.loadMore = false;
  }
};
</script>

<style scoped>
.section-actions {
  color: var(--yellow-primary);
  letter-spacing: -0.25px;
  font-weight: 600;
  margin-right: 20px;
}

.section-actions:hover {
  opacity: var(--hover);
  cursor: pointer;
}

.section-title {
  font-weight: 600;
  font-size: 24px;
  line-height: 26px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  border-left: 4px solid;
  padding-left: 12px;
}

.news-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
  padding-top: 20px;
}

.news-grid-enter-active,
.news-grid-leave-active {
  transition: all 0.5s ease;
}

.news-grid-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.news-grid-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.news-item {
  transition: all 0.5s ease;
}

.image-container {
  position: relative;
  width: 100%;
  height: 136px;
  border-radius: 8px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  bottom: 4px;
  left: 4px;
  padding: 2px 4px;
  background: rgba(17, 17, 17, 0.8);
  border-radius: 4px;
  font-family: var(--sport-category-tags);
  font-size: 12px;
  text-transform: uppercase;
}

.category-tag.other {
  color: var(--yellow-primary);
}

.news-content h3 {
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: var(--text-white);
  margin: 0;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.load-more-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 180px;
  height: 44px;
  background: var(--yellow-primary);
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-90);
  border: none;
  cursor: pointer;
}

.sidebar-header {
  padding-bottom: 16px;
}

.sidebar-header h3.other {
  font-size: 24px;
  line-height: 26px;
}

.related-news-list {
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
  margin-bottom: 24px;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  color: inherit;
}

.related-news-item:hover {
  transform: translateX(4px);
}

.related-news-item:last-child {
  margin-bottom: 0;
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

@media screen and (max-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}

.sub-header {
  background: var(--bg-90);
  padding: 0 20px;
  border-bottom: 1px solid var(--bg-70);
}

.sub-nav {
  height: 56px;
  display: flex;
  align-items: center;
}

.sub-nav ul {
  display: flex;
  list-style: none;
  gap: 32px;
  margin: 0;
  padding: 0;
}

.sub-nav a {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-white);
  text-decoration: none;
  text-transform: uppercase;
  padding: 16px 0;
  position: relative;
}

.sub-nav a.active {
  color: var(--yellow-primary);
}

.sub-nav a.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--yellow-primary);
}

.sub-nav a:hover:not(.active) {
  color: var(--text-white-60);
}
</style>
