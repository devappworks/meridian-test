<template>
  <div class="tag-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">{{ tagTitle }}</h2>
        </div>

        <SkeletonFeatured v-if="loading.featured" />
        <FeaturedArticle
          v-else-if="featuredArticle"
          :article="featuredArticle"
        />

        <!-- Main Tag Articles Grid -->
        <SkeletonNewsGrid v-if="loading.main" :columns="4" :cardCount="16" />
        <NewsGrid
          v-else-if="tagNews.length > 0"
          :sport="tagTitle"
          :news="tagNews"
        />

        <!-- No articles message -->
        <div
          v-else-if="!loading.main && tagNews.length === 0"
          class="no-articles"
        >
          <p>Nema članaka za ovaj tag.</p>
        </div>

        <LiveStream v-if="tagNews.length > 0" />

        <SkeletonNewsGrid v-if="loading.main" :columns="4" :cardCount="12" />
        <div v-else-if="loadMoreTagNews.length > 0">
          <NewsGrid
            :sport="tagTitle"
            :news="loadMoreTagNews"
            showLoadMore="true"
            :loading="isLoading"
            @load-more="loadMore"
          />
          <SkeletonNewsGrid v-if="loading.loadMore" :columns="4" />
        </div>

        <LiveStream v-if="tagNews.length > 0" />

        <!-- Other News Section -->
        <SkeletonNewsGrid v-if="loading.other" :columns="4" />
        <NewsGrid
          v-else-if="otherNews.length > 0"
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
            <h3 class="tag-header">NAJNOVIJE VESTI</h3>
          </div>

          <!-- Related news skeleton -->
          <SkeletonRelatedNews v-if="loading.sidebar" />
          <div v-else-if="relatedNews.length > 0" class="related-news-list">
            <div
              v-for="(news, index) in relatedNews"
              :key="index"
              class="related-news-item"
              @click="navigateToArticle(news.id)"
            >
              <div class="number">{{ index + 1 }}</div>
              <div class="content">
                <div class="category tag-category">{{ tagTitle }}</div>
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
import SkeletonFeatured from "@/components/skeletons/SkeletonFeatured.vue";
import FeaturedArticle from "@/components/Featured.vue";

export default {
  name: "TagPage",
  components: {
    NewsGrid,
    NewsletterForm,
    AdBanners,
    LiveStream,
    SkeletonNewsGrid,
    SkeletonRelatedNews,
    SkeletonFeatured,
    FeaturedArticle,
  },
  props: {
    tagId: {
      type: String,
      required: true,
    },
    tagName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      featuredArticle: null,
      tagNews: [],
      loadMoreTagNews: [],
      otherNews: [],
      relatedNews: [],
      currentPage: 1,
      isLoading: false,
      hasMorePages: true,
      loading: {
        featured: true,
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      },
    };
  },
  computed: {
    tagTitle() {
      return this.tagName ? this.tagName.toUpperCase() : "TAG";
    },
  },
  watch: {
    tagId: {
      handler() {
        this.resetNews();
        this.fetchTagArticles();
      },
      immediate: true,
    },
  },
  methods: {
    // Helper function to map article data consistently
    mapArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: this.tagTitle,
        date: this.formatDate(article.publish_date),
        url: article.url,
        image: article.feat_images?.medium?.url || null,
        category: article.categories[0].slug,
        slug: article.slug,
      };
    },

    // Helper function to map sidebar article data
    mapSidebarArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: this.tagTitle,
        date: this.formatDate(article.publish_date),
        category: article.categories[0].slug,
        slug: article.slug,
      };
    },

    async fetchTagArticles() {
      this.loading = {
        featured: true,
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      };

      try {
        const tagData = await fetchFromApi("/getArticles", {
          articleLimit: 56,
          "tag[]": this.tagId,
          page: 1,
        });

        const articles = tagData.result.articles;

        if (articles.length > 0) {
          this.featuredArticle = {
            id: articles[0].id,
            title: articles[0].title,
            sport: this.tagTitle,
            date: this.formatDate(articles[0].publish_date),
            url: articles[0].url,
            image: articles[0].feat_images?.large?.url || null,
            content: articles[0].contents,
            featured: true,
            category: articles[0].categories[0].slug,
            slug: articles[0].slug,
          };

          this.tagNews = articles.slice(1, 17).map(this.mapArticle);
          this.loadMoreTagNews = articles.slice(17, 29).map(this.mapArticle);
          this.relatedNews = articles.slice(29, 32).map(this.mapSidebarArticle);

          // Check if we have more pages
          this.hasMorePages = articles.length >= 56;
        }

        // Fetch other news (articles not related to this tag)
        await this.fetchOtherNews();

        // Hide all loading states
        this.loading = {
          featured: false,
          main: false,
          loadMore: false,
          other: false,
          sidebar: false,
        };
      } catch (error) {
        console.error("Error fetching tag articles:", error);
        this.resetNews();
        // Hide loading states on error
        this.loading = {
          featured: false,
          main: false,
          loadMore: false,
          other: false,
          sidebar: false,
        };
      }
    },

    async fetchOtherNews() {
      try {
        const otherData = await fetchFromApi("/getArticles", {
          articleLimit: 24,
          page: 1,
        });

        const articles = otherData.result.articles;

        // Filter out articles that are already in our tag news
        const existingIds = new Set([
          this.featuredArticle?.id,
          ...this.tagNews.map((article) => article.id),
          ...this.loadMoreTagNews.map((article) => article.id),
          ...this.relatedNews.map((article) => article.id),
        ]);

        const filteredArticles = articles.filter(
          (article) => !existingIds.has(article.id)
        );

        this.otherNews = filteredArticles.slice(0, 8).map((article) => ({
          id: article.id,
          title: article.title,
          sport: "OSTALE VESTI",
          date: this.formatDate(article.publish_date),
          url: article.url,
          image: article.feat_images?.medium?.url || null,
          category: article.categories[0].slug,
          slug: article.slug,
        }));
      } catch (error) {
        console.error("Error fetching other news:", error);
        this.otherNews = [];
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
            "tag[]": this.tagId,
            page: currentPage,
          });

          const newArticles = response.result.articles;

          if (newArticles.length > 0) {
            // Get all existing URLs to check for duplicates
            const existingUrls = new Set([
              ...this.tagNews.map((article) => article.url),
              ...this.loadMoreTagNews.map((article) => article.url),
            ]);

            // Filter out any articles that we've already shown
            const uniqueNewArticles = newArticles.filter(
              (article) => !existingUrls.has(article.url)
            );

            const mappedArticles = uniqueNewArticles.map(this.mapArticle);

            if (mappedArticles.length > 0) {
              // Found unique articles, add them and exit the loop
              this.loadMoreTagNews = [
                ...this.loadMoreTagNews,
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
      this.featuredArticle = null;
      this.tagNews = [];
      this.loadMoreTagNews = [];
      this.otherNews = [];
      this.relatedNews = [];
      this.currentPage = 1;
      this.hasMorePages = true;
    },

    formatDate(dateString) {
      // Robust parsing similar to ArticlePage
      if (!dateString) return "";

      let date;
      if (typeof dateString === "number") {
        const ms = dateString > 1e12 ? dateString : dateString * 1000;
        date = new Date(ms);
      } else if (typeof dateString === "string") {
        const trimmed = dateString.trim();
        const dmYhm = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\s+(\d{1,2}):(\d{2})$/;
        const dmY = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/;
        const dmySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?$/;
        const ymdHms = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
        let m = trimmed.match(dmySlash);
        if (m) {
          const [_, d, mth, y, h, min] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h || 0), Number(min || 0));
        } else if ((m = trimmed.match(dmYhm))) {
          const [_, d, mth, y, h, min] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h), Number(min));
        } else if ((m = trimmed.match(dmY))) {
          const [_, d, mth, y] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d));
        } else if ((m = trimmed.match(ymdHms))) {
          const [_, y, mth, d, h, min, s] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h), Number(min), Number(s || 0));
        } else {
          const normalized = trimmed.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})$/, ".$1$2");
          date = new Date(normalized);
        }
      } else {
        date = new Date(dateString);
      }

      if (!(date instanceof Date) || isNaN(date.getTime())) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${day}.${month}.${year}. ${hours}:${minutes}`;
    },

    navigateToArticle(id) {
      const found = [...this.tagNews, ...this.loadMoreTagNews].find((a) => a.id === id);
      const target = `/${found.category}/${found.slug}`;
      this.$router.push(target);
    },
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
  color: var(--yellow-primary);
  border-left: 4px solid var(--yellow-primary);
  padding-left: 12px;
}

.no-articles {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-white);
  font-size: 18px;
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

.category-tag.tag-category {
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

.sidebar-header h3.tag-header {
  font-size: 24px;
  line-height: 26px;
  color: var(--yellow-primary);
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

.related-news-item .category.tag-category {
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
