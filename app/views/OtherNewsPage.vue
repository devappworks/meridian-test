<template>
  <div class="other-news-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">OSTALE VESTI</h2>
        </div>

        <!-- Main Other News Grid -->
        <SkeletonNewsGrid v-if="loading.main" :columns="4" />
        <NewsGrid v-else sport="OSTALE VESTI" :news="otherNews" />

        <LiveStream />

        <div v-if="!loading.main">
          <NewsGrid
            sport="OSTALE VESTI"
            :news="loadMoreOtherNews"
            showLoadMore="true"
            :loading="isLoading"
            @load-more="loadMore"
          />
          <SkeletonNewsGrid v-if="loading.loadMore" :columns="4" />
        </div>

        <LiveStream />

        <!-- Additional News Section -->
        <SkeletonNewsGrid v-if="loading.other" :columns="4" />
        <NewsGrid
          v-else
          title="DODATNE VESTI"
          sport="OSTALE VESTI"
          :news="additionalNews"
          background="true"
        />
      </div>

      <!-- Sidebar -->
      <div class="sidebar-column">
        <div class="sidebar-news">
          <div class="sidebar-header">
            <h3 class="other">NAJNOVIJE VESTI</h3>
          </div>

          <!-- Related news skeleton -->
          <SkeletonRelatedNews v-if="loading.sidebar" />
          <div v-else class="related-news-list">
            <div
              v-for="(news, index) in relatedNews"
              :key="news.id"
              class="related-news-item"
              @click="navigateToArticle(news.id)"
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
            </div>
          </div>
        </div>
        <NewsletterForm />
        <AdBanners />
      </div>
    </div>
  </div>
</template>

<script>
import NewsletterForm from "@/components/Newsletter.vue";
import AdBanners from "@/components/AdBanners.vue";
import LiveStream from "@/components/LiveStream.vue";
import NewsGrid from "@/components/NewsGrid.vue";
import SkeletonNewsGrid from "@/components/skeletons/SkeletonNewsGrid.vue";
import SkeletonRelatedNews from "@/components/skeletons/SkeletonRelatedNews.vue";
import { fetchFromApi } from "@/services/api";

export default {
  name: "OtherNewsPage",
  components: {
    NewsGrid,
    NewsletterForm,
    AdBanners,
    LiveStream,
    SkeletonNewsGrid,
    SkeletonRelatedNews,
  },
  data() {
    return {
      otherNews: [],
      loadMoreOtherNews: [],
      additionalNews: [],
      relatedNews: [],
      currentPage: 1,
      isLoading: false,
      hasMorePages: true,
      loading: {
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      },
    };
  },
  methods: {
    async fetchOtherArticles() {
      this.loading = {
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      };

      try {
        // Fetch "other" news articles
        // Option 1: Use specific category ID for "other news" (uncomment and adjust ID):
        // 'category[]': 1, // Replace 1 with the actual "other news" category ID

        // Option 2: Fetch all articles and filter out sports categories in the mapping
        // (This is currently used - you may want to adjust based on your needs)
        const otherData = await fetchFromApi("/getArticles", {
          articleLimit: 53,
          page: 1,
        });

        const articles = otherData.result.articles;

        if (articles.length > 0) {
          // Filter out sports articles if fetching from all categories
          const filteredArticles = this.filterOutSportsArticles(articles);

          // Main other news grid (first 12 articles)
          this.otherNews = filteredArticles.slice(0, 12).map((article) => ({
            id: article.id,
            title: article.title,
            sport: "OSTALE VESTI",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));

          this.loadMoreOtherNews = filteredArticles
            .slice(12, 24)
            .map((article) => ({
              id: article.id,
              title: article.title,
              sport: "OSTALE VESTI",
              date: article.date,
              url: article.url,
              image: article.feat_images["medium"]
                ? article.feat_images["medium"].url
                : null,
            }));

          // Additional other news
          this.additionalNews = filteredArticles
            .slice(24, 48)
            .map((article) => ({
              id: article.id,
              title: article.title,
              sport: "OSTALE VESTI",
              date: article.date,
              url: article.url,
              image: article.feat_images["medium"]
                ? article.feat_images["medium"].url
                : null,
            }));

          // Related news sidebar
          this.relatedNews = filteredArticles.slice(48, 53).map((article) => ({
            id: article.id,
            title: article.title,
            sport: "OSTALE VESTI",
            date: article.date,
          }));

          // Check if we have more pages
          this.hasMorePages = filteredArticles.length >= 53;

          // Hide all loading states
          this.loading = {
            main: false,
            loadMore: false,
            other: false,
            sidebar: false,
          };
        }
      } catch (error) {
        console.error("Error fetching other articles:", error);
        this.resetNews();
        // Hide loading states on error
        this.loading = {
          main: false,
          loadMore: false,
          other: false,
          sidebar: false,
        };
      }
    },

    async loadMore() {
      if (this.isLoading || !this.hasMorePages) return;

      try {
        this.isLoading = true;
        this.loading.loadMore = true;

        // Store current scroll position to prevent jumping
        const scrollY = window.scrollY;

        let foundNewArticles = false;
        let currentPage = this.currentPage + 1;

        // Keep trying pages until we find unique articles or run out of pages
        while (!foundNewArticles && this.hasMorePages) {
          const response = await fetchFromApi("/getArticles", {
            articleLimit: 12,
            // Match the same approach as fetchOtherArticles
            page: currentPage,
          });

          const newArticles = response.result.articles;

          if (newArticles.length > 0) {
            // Get all existing URLs to check for duplicates
            const existingUrls = new Set([
              ...this.otherNews.map((article) => article.url),
              ...this.loadMoreOtherNews.map((article) => article.url),
            ]);

            // Filter out any articles that we've already shown
            const uniqueNewArticles = newArticles.filter(
              (article) => !existingUrls.has(article.url)
            );

            const mappedArticles = uniqueNewArticles.map((article) => ({
              id: article.id,
              title: article.title,
              sport: "OSTALE VESTI",
              date: article.date,
              url: article.url,
              image: article.feat_images["medium"]
                ? article.feat_images["medium"].url
                : null,
            }));

            if (mappedArticles.length > 0) {
              // Found unique articles, add them and exit the loop
              this.loadMoreOtherNews = [
                ...this.loadMoreOtherNews,
                ...mappedArticles,
              ];
              this.currentPage = currentPage;
              this.hasMorePages = newArticles.length >= 12;
              foundNewArticles = true;
            } else {
              // All articles were duplicates, try the next page
              currentPage++;
              this.hasMorePages = newArticles.length >= 12;
            }
          } else {
            this.hasMorePages = false;
          }
        }
        if (!foundNewArticles) {
          this.hasMorePages = false;
        }

        // Wait for DOM update, then restore scroll position
        this.$nextTick(() => {
          window.scrollTo(0, scrollY);
        });
      } catch (error) {
        console.error("Error loading more articles:", error);
      } finally {
        this.isLoading = false;
        this.loading.loadMore = false;
      }
    },

    resetNews() {
      this.otherNews = [];
      this.loadMoreOtherNews = [];
      this.additionalNews = [];
      this.relatedNews = [];
      this.currentPage = 1;
      this.hasMorePages = true;
    },

    filterOutSportsArticles(articles) {
      // If you want to show only truly uncategorized articles, filter out sports categories
      // If you want to show all non-sports articles, return the articles as-is
      // Comment/uncomment the lines below based on your preference:

      // Option 1: Filter out sports articles (uncomment the next two lines)
      // const sportsCategories = [28, 25, 24, 26]; // Football, Basketball, Volleyball, Tennis
      // return articles.filter(article => !sportsCategories.includes(article.category_id));

      // Option 2: Return all articles (current approach)
      return articles;
    },

    navigateToArticle(articleId) {
      const found = [...this.otherNews, ...this.loadMoreOtherNews].find((a) => a.id === articleId);
      const target = found && found.url ? found.url : `/article/${articleId}`;
      this.$router.push(target);
    },
  },
  mounted() {
    this.fetchOtherArticles();
  },
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
