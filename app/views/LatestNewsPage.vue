<template>
  <div class="latest-news-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">NAJNOVIJE VESTI</h2>
        </div>

        <!-- Main Latest News Grid -->
        <SkeletonNewsGrid v-if="loading.main" :columns="4" />
        <NewsGrid v-else sport="NAJNOVIJE" :news="latestNews" />

        <LiveStream />

        <div v-if="!loading.main">
          <NewsGrid
            sport="NAJNOVIJE"
            :news="loadMoreLatestNews"
            showLoadMore="true"
            :loading="isLoading"
            @load-more="loadMore"
          />
          <SkeletonNewsGrid v-if="loading.loadMore" :columns="4" />
        </div>

        <LiveStream />

        <!-- Other News Section -->
        <SkeletonNewsGrid v-if="loading.other" :columns="4" />
        <NewsGrid
          v-else
          title="OSTALE VESTI"
          sport="OSTALE VESTI"
          :news="otherNews"
          background="true"
        />
      </div>

      <!-- Sidebar -->
      <div class="sidebar-column">
        <div class="sidebar-news">
          <div class="sidebar-header">
            <h3 class="latest">NAJNOVIJE VESTI</h3>
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
                <div class="category" :class="getCategoryClass(news.sport)">
                  {{ news.sport }}
                </div>
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
  name: "LatestNewsPage",
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
      latestNews: [],
      loadMoreLatestNews: [],
      otherNews: [],
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
    async fetchLatestArticles() {
      this.loading = {
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      };

      try {
        const latestData = await fetchFromApi("/getArticles", {
          articleLimit: 53,
          page: 1,
        });

        const articles = latestData.result.articles;

        if (articles.length > 0) {
          // Main latest news grid (first 12 articles)
          this.latestNews = articles.slice(0, 12).map((article) => ({
            id: article.id,
            title: article.title,
            sport: this.getSportFromCategories(article.categories) || "VESTI",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));

          this.loadMoreLatestNews = articles.slice(12, 24).map((article) => ({
            id: article.id,
            title: article.title,
            sport: this.getSportFromCategories(article.categories) || "VESTI",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));

          // Other latest news
          this.otherNews = articles.slice(24, 48).map((article) => ({
            id: article.id,
            title: article.title,
            sport: this.getSportFromCategories(article.categories) || "VESTI",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));

          // Related news sidebar
          this.relatedNews = articles.slice(48, 53).map((article) => ({
            id: article.id,
            title: article.title,
            sport: this.getSportFromCategories(article.categories) || "VESTI",
            date: article.date,
          }));

          // Check if we have more pages
          this.hasMorePages = articles.length >= 53;

          // Hide all loading states
          this.loading = {
            main: false,
            loadMore: false,
            other: false,
            sidebar: false,
          };
        }
      } catch (error) {
        console.error("Error fetching latest articles:", error);
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
            page: currentPage,
          });

          const newArticles = response.result.articles;

          if (newArticles.length > 0) {
            // Get all existing URLs to check for duplicates
            const existingUrls = new Set([
              ...this.latestNews.map((article) => article.url),
              ...this.loadMoreLatestNews.map((article) => article.url),
            ]);

            // Filter out any articles that we've already shown
            const uniqueNewArticles = newArticles.filter(
              (article) => !existingUrls.has(article.url)
            );

            const mappedArticles = uniqueNewArticles.map((article) => ({
              id: article.id,
              title: article.title,
              sport: this.getSportFromCategories(article.categories) || "VESTI",
              date: article.date,
              url: article.url,
              image: article.feat_images["medium"]
                ? article.feat_images["medium"].url
                : null,
            }));

            if (mappedArticles.length > 0) {
              // Found unique articles, add them and exit the loop
              this.loadMoreLatestNews = [
                ...this.loadMoreLatestNews,
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
      this.latestNews = [];
      this.loadMoreLatestNews = [];
      this.otherNews = [];
      this.relatedNews = [];
      this.currentPage = 1;
      this.hasMorePages = true;
    },

    getSportFromCategories(categories) {
      const sportMap = {
        Fudbal: "FUDBAL",
        Košarka: "KOŠARKA",
        Tenis: "TENIS",
        Odbojka: "ODBOJKA",
      };

      const sportCategory = categories.find((cat) => sportMap[cat.name]);
      return sportCategory ? sportMap[sportCategory.name] : null;
    },

    getCategoryClass(sport) {
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
    },

    navigateToArticle(articleId) {
      this.$router.push(`/article/${articleId}`);
    },
  },
  mounted() {
    this.fetchLatestArticles();
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

.category-tag.football {
  color: var(--green-primary);
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

.sidebar-header h3.latest {
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
