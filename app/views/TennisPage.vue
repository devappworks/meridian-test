<template>
  <div class="tennis-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title tennis">
            TENIS - {{ currentCategoryName }}
          </h2>
        </div>

        <SkeletonFeatured v-if="loading.featured" />
        <FeaturedArticle v-else :article="featuredArticle" />

        <!-- Main Tennis News Grid -->
        <SkeletonNewsGrid v-if="loading.main" :columns="4" :cardCount="16" />
        <NewsGrid v-else sport="TENIS" :news="tennisNews" />

        <LiveStream />

        <SkeletonNewsGrid v-if="loading.main" :columns="4" :cardCount="12" />
        <div v-else>
          <NewsGrid
            sport="TENIS"
            :news="loadMoreTennisNews"
            showLoadMore="true"
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
            <h3 class="tennis">NAJNOVIJE VESTI</h3>
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
                <div class="category tennis">TENIS</div>
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
import SkeletonFeatured from "@/components/skeletons/SkeletonFeatured.vue";
import FeaturedArticle from "@/components/Featured.vue";
import { fetchFromApi } from "@/services/api";

export default {
  name: "TennisPage",
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
  data() {
    return {
      featuredArticle: null,
      tennisNews: [],
      loadMoreTennisNews: [],
      otherNews: [],
      relatedNews: [],
      currentPage: 1,
      isLoading: false,
      hasMorePages: true,
      currentCategory: 41,
      mainTennisCategory: 41,
      tennisMenuData: null,
      currentCategoryName: "TENIS",
      categoryMapping: {},
      loading: {
        featured: true,
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      },
      isSwitchingCategory: false,
    };
  },
  methods: {
    // Helper function to map article data consistently
    mapArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: "TENIS",
        date: article.date,
        url: article.url,
        image: article.feat_images["medium"]
          ? article.feat_images["medium"].url
          : null,
        category: article.categories[0].slug,
        slug: article.slug,
      };
    },

    // Helper function to build category array for API calls
    buildCategoryArray() {
      if (this.currentCategory === this.mainTennisCategory) {
        return this.mainTennisCategory;
      } else {
        return this.currentCategory;
      }
    },

    filterArticlesBySubcategory(articles) {
      return articles;
    },

    async fetchWebSettings() {
      try {
        const webSettings = await fetchFromApi("/getWebSettings");

        if (webSettings.success && webSettings.result.languages?.length > 0) {
          const defaultLanguage = webSettings.result.languages[0];
          const tennisMenu = defaultLanguage.web_menu?.find(
            (menu) => menu.title === "TENIS"
          );

          if (tennisMenu) {
            // Store the entire tennis menu data for navigation
            this.tennisMenuData = tennisMenu;

            // Build category mapping
            this.categoryMapping = {};

            // Map main tennis category
            if (tennisMenu.web_categories?.length > 0) {
              const mainCategoryId = tennisMenu.web_categories[0];
              this.categoryMapping[mainCategoryId] = "SVE VESTI";
              this.mainTennisCategory = mainCategoryId;
              this.currentCategory = mainCategoryId;
            }

            // Map subcategories
            if (tennisMenu.sub_menu?.length > 0) {
              tennisMenu.sub_menu.forEach((subMenu) => {
                if (subMenu.web_categories?.length > 0) {
                  this.categoryMapping[subMenu.web_categories[0]] =
                    subMenu.title;
                }
              });
            }

            // Set initial category name
            this.currentCategoryName =
              this.categoryMapping[this.currentCategory] || "TENIS";
          }
        }
      } catch (error) {
        console.error("Error fetching web settings:", error);
      }
    },

    async switchCategory(categoryId) {
      this.currentCategory = categoryId;
      this.currentCategoryName = this.categoryMapping[categoryId] || "TENIS";

      this.isSwitchingCategory = true;

      try {
        await this.fetchTennisArticles();
      } finally {
        this.isSwitchingCategory = false;
      }

      // Notify header about the current category
      window.dispatchEvent(
        new CustomEvent("tennis-category-updated", {
          detail: { categoryId },
        })
      );
    },

    // Handle category change from header
    handleGlobalCategoryChange(event) {
      const { categoryId } = event.detail;
      this.switchCategory(categoryId);
    },

    // Helper function to map sidebar article data
    mapSidebarArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: "TENIS",
        date: article.date,
        category: article.categories[0].slug,
        slug: article.slug,
      };
    },

    async fetchTennisArticles() {
      if (this.isSwitchingCategory) {
        this.loading = {
          featured: true,
          main: true,
          loadMore: false,
          other: true,
          sidebar: true,
        };
      } else {
        this.loading = {
          featured: this.featuredArticle === null,
          main: this.tennisNews.length === 0,
          loadMore: false,
          other: this.otherNews.length === 0,
          sidebar: this.relatedNews.length === 0,
        };
      }

      try {
        const tennisData = await fetchFromApi("/getArticles", {
          articleLimit: 50,
          "category[]": this.buildCategoryArray(),
        });

        const allArticles = tennisData.result.articles;
        const filteredArticles = this.filterArticlesBySubcategory(allArticles);

        if (filteredArticles.length > 0) {
          this.featuredArticle = {
            id: filteredArticles[0].id,
            title: filteredArticles[0].title,
            sport: "TENIS",
            date: filteredArticles[0].date,
            url: filteredArticles[0].url,
            image: filteredArticles[0].feat_images["large"]
              ? filteredArticles[0].feat_images["large"].url
              : null,
            content: filteredArticles[0].contents,
            featured: true,
            category: filteredArticles[0].categories[0].slug,
            slug: filteredArticles[0].slug,
          };

          this.tennisNews = filteredArticles.slice(1, 17).map(this.mapArticle);
          this.loadMoreTennisNews = filteredArticles
            .slice(17, 29)
            .map(this.mapArticle);
          this.otherNews = filteredArticles.slice(29, 37).map(this.mapArticle);
          this.relatedNews = filteredArticles
            .slice(-3)
            .map(this.mapSidebarArticle);

          const articlesUsed = 40;
          if (this.currentCategory === this.mainTennisCategory) {
            this.hasMorePages = filteredArticles.length > articlesUsed;
          } else {
            this.hasMorePages = filteredArticles.length >= articlesUsed;
          }

          this.currentPage = 1;

          this.loading = {
            featured: false,
            main: false,
            loadMore: false,
            other: false,
            sidebar: false,
          };
        } else {
          this.resetNews();
          this.loading = {
            featured: false,
            main: false,
            loadMore: false,
            other: false,
            sidebar: false,
          };
        }
      } catch (error) {
        console.error("Error fetching tennis articles:", error);
        this.resetNews();
        this.loading = {
          featured: false,
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

        const scrollY = window.scrollY;

        let collectedArticles = [];
        let currentPage = this.currentPage + 1;
        const targetCount = 12;

        while (collectedArticles.length < targetCount && this.hasMorePages) {
          const response = await fetchFromApi("/getArticles", {
            articleLimit: 12,
            "category[]": this.buildCategoryArray(),
            page: currentPage,
          });

          const allNewArticles = response.result.articles;
          const filteredNewArticles =
            this.filterArticlesBySubcategory(allNewArticles);

          if (filteredNewArticles.length > 0) {
            const existingUrls = new Set([
              ...this.tennisNews.map((article) => article.url),
              ...this.loadMoreTennisNews.map((article) => article.url),
              ...collectedArticles.map((article) => article.url),
            ]);

            const uniqueNewArticles = filteredNewArticles.filter(
              (article) => !existingUrls.has(article.url)
            );

            const mappedArticles = uniqueNewArticles.map(this.mapArticle);
            collectedArticles = [...collectedArticles, ...mappedArticles];
          }

          this.hasMorePages = allNewArticles.length >= 12;
          currentPage++;

          if (currentPage > this.currentPage + 10) {
            console.warn("Reached maximum page limit while fetching articles");
            break;
          }

          if (
            currentPage > this.currentPage + 3 &&
            collectedArticles.length === 0
          ) {
            console.warn(
              "No articles found after filtering across multiple pages"
            );
            this.hasMorePages = false;
            break;
          }
        }

        if (collectedArticles.length > 0) {
          const articlesToAdd = collectedArticles.slice(0, targetCount);
          this.loadMoreTennisNews = [
            ...this.loadMoreTennisNews,
            ...articlesToAdd,
          ];
          this.currentPage = currentPage - 1;

          if (collectedArticles.length < targetCount) {
            this.hasMorePages = false;
          }
        } else {
          this.hasMorePages = false;
        }

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
      this.tennisNews = [];
      this.loadMoreTennisNews = [];
      this.otherNews = [];
      this.relatedNews = [];
      this.currentPage = 1;
      this.hasMorePages = true;
    },

    navigateToArticle(articleId) {
      const found = [...this.tennisNews, ...this.loadMoreTennisNews].find((a) => a.id === articleId);
      const target = `/${found.sport.toLowerCase()}/${found.slug}`;
      this.$router.push(target);
    },
  },
  async mounted() {
    await this.fetchWebSettings();
    this.fetchTennisArticles();

    window.addEventListener(
      "tennis-category-changed",
      this.handleGlobalCategoryChange
    );

    window.dispatchEvent(
      new CustomEvent("tennis-category-updated", {
        detail: { categoryId: this.currentCategory },
      })
    );
  },
  beforeUnmount() {
    window.removeEventListener(
      "tennis-category-changed",
      this.handleGlobalCategoryChange
    );
  },
};
</script>

<style scoped>
.section-title {
  font-weight: 600;
  font-size: 24px;
  line-height: 26px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  padding-left: 12px;
  border-left: 4px solid var(--text-white);
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

.tennis {
  color: var(--blue-primary);
  border-left-color: var(--blue-primary);
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

.sidebar-header h3 {
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

.related-news-item .category.tennis {
  color: var(--blue-primary);
}

.related-news-item h3 {
  font-weight: 600;
  font-size: 14px;
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
</style>
