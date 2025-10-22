<script setup>
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/homepage-og.jpg`;

useHead({
  title: "Moje vesti | Meridian Sport",
  meta: [
    { name: "description", content: "Personalizovane sportske vesti prema vašim interesovanjima. Odaberite kategorije koje vas zanimaju i pristupite najnovijim vestima iz fudbala, košarke, tenisa i drugih sportova." },
    { name: "robots", content: "noindex, follow" }, // User-specific content shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: "Moje vesti | Meridian Sport" },
    { property: "og:description", content: "Personalizovane sportske vesti prema vašim interesovanjima. Odaberite kategorije koje vas zanimaju i pristupite najnovijim vestima." },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Moje vesti | Meridian Sport" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Moje vesti | Meridian Sport" },
    { name: "twitter:description", content: "Personalizovane sportske vesti prema vašim interesovanjima." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Moje vesti | Meridian Sport" }
  ]
});
</script>

<template>
  <div>
    <!-- Full Page Loading Overlay -->
    <div v-if="fullPageLoading" class="full-page-loading-overlay">
      <div class="loading-spinner-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Učitavanje vesti...</p>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="main-column">
        <div class="news-section">
          <div class="section-header">
            <h2 class="section-title">MOJE VESTI</h2>
            <div class="section-actions" @click="isSettingsModalOpen = true">
              <p>Podešavanje kategorija</p>
            </div>
          </div>
          <div v-if="!hasSelectedCategories" class="no-categories-message">
            <p>
              Niste odabrali kategorije. Kliknite na "Podešavanje kategorija" da
              odaberete vesti koje vas zanimaju.
            </p>
          </div>
          <NewsGrid
            v-else
            :news="firstGridItems"
            :loading="isLoading"
            :showLoadMore=false
          />

          <LiveStream v-if="hasSelectedCategories" />
        </div>

        <div v-if="hasSelectedCategories" class="news-section">
          <NewsGrid
            :news="secondGridItems"
            :loading="isLoading"
            :showLoadMore=true
            @load-more="loadMore"
          />
        </div>
        <LiveStream v-if="hasSelectedCategories" />

        <div v-if="hasSelectedCategories" class="news-section">
          <NewsGrid
            title="OSTALE VESTI"
            sport="OSTALE VESTI"
            :news="otherNewsItems"
            background=true
          />
        </div>
      </div>

      <div class="sidebar-column">
        <div class="sidebar-news">
          <div class="sidebar-header">
            <h3>NAJNOVIJE VESTI</h3>
          </div>
          <div class="related-news-list">
            <div
              v-for="(news, index) in relatedNews"
              :key="news.id"
              class="related-news-item"
              @click="navigateToArticle(news.id)"
            >
              <div class="number">{{ index + 1 }}</div>
              <div class="content">
                <div class="category" :class="getSportCssClass(news.sport)">
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
    <CategorySettingsModal
      :isOpen="isSettingsModalOpen"
      :selectedCategories="selectedCategories"
      @close="isSettingsModalOpen = false"
      @confirm="handleCategoryConfirm"
    />
  </div>
</template>

<script>
import NewsImage from "@/assets/images/image.jpg";
import NewsletterForm from "@/components/Newsletter.vue";
import AdBanners from "@/components/AdBanners.vue";
import LiveStream from "@/components/LiveStream.vue";
import NewsGrid from "@/components/NewsGrid.vue";
import CategorySettingsModal from "@/components/CategorySettingsModal.vue";
import { fetchFromApi } from "@/services/api";

export default {
  name: "MojeVesti",
  components: {
    NewsletterForm,
    AdBanners,
    LiveStream,
    NewsGrid,
    CategorySettingsModal,
  },
  data() {
    return {
      isSettingsModalOpen: false,
      isLoading: false,
      fullPageLoading: false,
      selectedCategories: [],
      newsItems: [],
      otherNewsItems: [],
      relatedNews: [],
      page: 1,
      hasMorePages: false,
    };
  },
  computed: {
    hasSelectedCategories() {
      return this.selectedCategories.length > 0;
    },
    firstGridItems() {
      return this.newsItems.slice(0, 8);
    },
    secondGridItems() {
      return this.newsItems.slice(8, 32);
    },
  },
  async mounted() {
    this.loadSelectedCategoriesFromStorage();
    if (this.hasSelectedCategories) {
      await this.fetchArticlesFromSelectedCategories();
    }
  },
  methods: {
    loadSelectedCategoriesFromStorage() {
      try {
        const savedCategories = localStorage.getItem("selectedCategories");
        if (savedCategories) {
          this.selectedCategories = JSON.parse(savedCategories);
        }
      } catch (error) {
        console.error("Error loading categories from localStorage:", error);
        this.selectedCategories = [];
      }
    },

    // Enhanced sport tagging system
    getSportTagFromCategory(categoryId, categoryName) {
      // Primary sport mapping based on category ID and name
      const primarySportMapping = {
        // Football related
        28: "FUDBAL",
        27: "DOMAĆI FUDBAL",
        33: "REPREZENTACIJE",
        42: "EVROPSKA TAKMIČENJA",

        // Basketball related
        25: "KOŠARKA",
        77: "EVROBASKET",

        // Tennis related
        41: "TENIS",

        // Volleyball related
        30: "ODBOJKA",

        // Other specific sports
        44: "INTERVJUI",
        80: "SPORT FOKUS",
        84: "SPORTSKA GEOGRAFIJA",
      };

      // Check for exact ID match first
      if (primarySportMapping[categoryId]) {
        return primarySportMapping[categoryId];
      }

      // If no exact match, use intelligent name-based mapping
      if (categoryName) {
        const nameLower = categoryName.toLowerCase();

        // Football variations
        if (
          nameLower.includes("fudbal") ||
          nameLower.includes("football") ||
          nameLower.includes("liga") ||
          nameLower.includes("premijer") ||
          nameLower.includes("evropsk") ||
          nameLower.includes("champion") ||
          nameLower.includes("uefa") ||
          nameLower.includes("fifa")
        ) {
          return "FUDBAL";
        }

        // Basketball variations
        if (
          nameLower.includes("košarka") ||
          nameLower.includes("basketball") ||
          nameLower.includes("evrobasket") ||
          nameLower.includes("aba") ||
          nameLower.includes("euroleague") ||
          nameLower.includes("nba")
        ) {
          return "KOŠARKA";
        }

        // Tennis variations
        if (
          nameLower.includes("tenis") ||
          nameLower.includes("tennis") ||
          nameLower.includes("wimbledon") ||
          nameLower.includes("roland") ||
          nameLower.includes("us open") ||
          nameLower.includes("australian")
        ) {
          return "TENIS";
        }

        // Volleyball variations
        if (
          nameLower.includes("odbojka") ||
          nameLower.includes("volleyball") ||
          nameLower.includes("volley")
        ) {
          return "ODBOJKA";
        }

        // Other sports detection
        if (nameLower.includes("rukomet") || nameLower.includes("handball")) {
          return "RUKOMET";
        }

        if (nameLower.includes("atletika") || nameLower.includes("track")) {
          return "ATLETIKA";
        }

        if (nameLower.includes("plivanje") || nameLower.includes("swimming")) {
          return "PLIVANJE";
        }

        if (
          nameLower.includes("gimnastika") ||
          nameLower.includes("gymnastics")
        ) {
          return "GIMNASTIKA";
        }

        if (
          nameLower.includes("boks") ||
          nameLower.includes("boxing") ||
          nameLower.includes("borilačke") ||
          nameLower.includes("mma")
        ) {
          return "BORILAČKE VEŠTINE";
        }

        if (
          nameLower.includes("auto") ||
          nameLower.includes("motor") ||
          nameLower.includes("formula") ||
          nameLower.includes("rally")
        ) {
          return "AUTOMOTO";
        }

        if (
          nameLower.includes("bicikl") ||
          nameLower.includes("cycling") ||
          nameLower.includes("bike")
        ) {
          return "BICIKLIZAM";
        }

        if (
          nameLower.includes("zimski") ||
          nameLower.includes("ski") ||
          nameLower.includes("snowboard") ||
          nameLower.includes("hokej")
        ) {
          return "ZIMSKI SPORTOVI";
        }

        if (
          nameLower.includes("esport") ||
          nameLower.includes("gaming") ||
          nameLower.includes("video game")
        ) {
          return "ESPORTS";
        }

        // Interview and special content
        if (nameLower.includes("intervju") || nameLower.includes("interview")) {
          return "INTERVJUI";
        }

        if (nameLower.includes("fokus") || nameLower.includes("focus")) {
          return "SPORT FOKUS";
        }

        if (
          nameLower.includes("geografija") ||
          nameLower.includes("geography")
        ) {
          return "SPORTSKA GEOGRAFIJA";
        }
      }

      // Ultimate fallback
      return "OSTALI SPORTOVI";
    },

    // Enhanced article mapping with better sport detection
    mapArticle(article) {
      let sportTag = "OSTALI SPORTOVI";
      let categoryName = "";

      // Try to get sport tag from category_id first
      if (article.category_id) {
        categoryName = this.getCategoryDisplayName(article.category_id);
        sportTag = this.getSportTagFromCategory(
          article.category_id,
          categoryName
        );
      }

      // If article has categories array, use that for more accurate tagging
      if (article.categories && article.categories.length > 0) {
        // Use the first category or look for a main sport category
        const mainSportCategory = article.categories.find((cat) =>
          ["Fudbal", "Košarka", "Tenis", "Odbojka"].includes(cat.name)
        );

        if (mainSportCategory) {
          const sportMapping = {
            Fudbal: "FUDBAL",
            Košarka: "KOŠARKA",
            Tenis: "TENIS",
            Odbojka: "ODBOJKA",
          };
          sportTag = sportMapping[mainSportCategory.name];
          categoryName = sportTag;
        } else {
          // Use intelligent mapping for the first category
          const firstCategory = article.categories[0];
          sportTag = this.getSportTagFromCategory(
            firstCategory.id,
            firstCategory.name
          );
          categoryName = firstCategory.name.toUpperCase();
        }
      }

      return {
        id: article.id,
        title: article.title,
        sport: sportTag,
        date: article.date,
        url: article.url,
        image:
          article.feat_images && article.feat_images["small"]
            ? article.feat_images["small"].url
            : NewsImage,
        featImages: article.feat_images || null, // Include full feat_images for WebP support
        //category: sportTag, // Use the computed sport tag as category too
        categoryName: categoryName,
        category: useArticleCategory(article) || article.categories[0].slug,
        slug: article.slug,
      };
    },

    mapSidebarArticle(article) {
      let sportTag = "OSTALI SPORTOVI";

      if (article.category_id) {
        const categoryName = this.getCategoryDisplayName(article.category_id);
        sportTag = this.getSportTagFromCategory(
          article.category_id,
          categoryName
        );
      }

      if (article.categories && article.categories.length > 0) {
        const mainSportCategory = article.categories.find((cat) =>
          ["Fudbal", "Košarka", "Tenis", "Odbojka"].includes(cat.name)
        );

        if (mainSportCategory) {
          const sportMapping = {
            Fudbal: "FUDBAL",
            Košarka: "KOŠARKA",
            Tenis: "TENIS",
            Odbojka: "ODBOJKA",
          };
          sportTag = sportMapping[mainSportCategory.name];
        } else {
          const firstCategory = article.categories[0];
          sportTag = this.getSportTagFromCategory(
            firstCategory.id,
            firstCategory.name
          );
        }
      }

      return {
        id: article.id,
        title: article.title,
        sport: sportTag,
        category: useArticleCategory(article) || article.categories[0].slug,
        date: article.date,
        slug: article.slug,
      };
    },

    // Keep the original method for backward compatibility
    getCategoryDisplayName(categoryId) {
      const categoryMap = {
        27: "DOMAĆI FUDBAL",
        28: "FUDBAL",
        33: "REPREZENTACIJE",
        38: "OSTALI SPORTOVI",
        42: "EVROPSKA TAKMIČENJA",
        44: "INTERVJUI",
        77: "EVROBASKET",
        80: "SPORT FOKUS",
        84: "SPORTSKA GEOGRAFIJA",
      };
      return categoryMap[categoryId] || "OSTALI SPORTOVI";
    },

    // Convert sport tags to CSS class names
    getSportCssClass(sportTag) {
      console.log(sportTag, "SPORT TAG");
      const classMap = {
        FUDBAL: "fudbal",
        "DOMAĆI FUDBAL": "fudbal",
        REPREZENTACIJE: "fudbal",
        "EVROPSKA TAKMIČENJA": "fudbal",
        KOŠARKA: "košarka",
        EVROBASKET: "košarka",
        TENIS: "tenis",
        ODBOJKA: "odbojka",
        RUKOMET: "rukomet",
        ATLETIKA: "atletika",
        PLIVANJE: "plivanje",
        GIMNASTIKA: "gimnastika",
        "BORILAČKE VEŠTINE": "borilačke",
        AUTOMOTO: "automoto",
        BICIKLIZAM: "biciklizam",
        "ZIMSKI SPORTOVI": "zimski",
        ESPORTS: "esports",
        INTERVJUI: "intervjui",
        "SPORT FOKUS": "fokus",
        "SPORTSKA GEOGRAFIJA": "geografija",
        "OSTALI SPORTOVI": "ostali",
        "OSTALE VESTI": "ostale",
      };

      return classMap[sportTag] || "ostali";
    },

    async fetchArticlesFromSelectedCategories() {
      if (!this.hasSelectedCategories) return;

      this.isLoading = true;
      try {
        // Build category array for API call
        const categoryParams = {};
        this.selectedCategories.forEach((categoryId, index) => {
          categoryParams[`category[${index}]`] = categoryId;
        });

        // Fetch both selected categories articles and latest articles globally
        const [response, latestResponse] = await Promise.all([
          fetchFromApi("/getArticles", {
            articleLimit: 50,
            ...categoryParams,
          }),
          fetchFromApi("/getArticles", {
            articleLimit: 50,
          })
        ]);

        if (response.success && response.result.articles) {
          const allArticles = response.result.articles;

          // Map articles to the required format
          this.newsItems = allArticles.slice(0, 32).map(this.mapArticle);
          this.otherNewsItems = allArticles.slice(32, 40).map(this.mapArticle);

          this.hasMorePages = allArticles.length >= 50;
          this.page = 1;
        }

        // Process latest articles for sidebar
        if (latestResponse.success && latestResponse.result.articles) {
          this.relatedNews = latestResponse.result.articles.slice(0, 8).map(this.mapSidebarArticle);
          console.log(this.relatedNews, "RELATED NEWS");
        }
      } catch (error) {
        console.error(
          "Error fetching articles from selected categories:",
          error
        );
        // Reset to empty arrays on error
        this.newsItems = [];
        this.otherNewsItems = [];
        this.relatedNews = [];
      } finally {
        this.isLoading = false;
      }
    },
    async loadMore() {
      if (this.isLoading || !this.hasMorePages || !this.hasSelectedCategories)
        return;

      this.isLoading = true;
      try {
        const nextPage = this.page + 1;

        // Build category array for API call
        const categoryParams = {};
        this.selectedCategories.forEach((categoryId, index) => {
          categoryParams[`category[${index}]`] = categoryId;
        });

        const response = await fetchFromApi("/getArticles", {
          articleLimit: 12,
          page: nextPage,
          ...categoryParams,
        });

        if (response.success && response.result.articles) {
          const newArticles = response.result.articles;

          if (newArticles.length > 0) {
            // Filter out duplicates
            const existingUrls = new Set(
              this.newsItems.map((article) => article.url)
            );
            const uniqueNewArticles = newArticles.filter(
              (article) => !existingUrls.has(article.url)
            );

            // Add new articles to the existing list
            const mappedArticles = uniqueNewArticles.map(this.mapArticle);
            this.newsItems.push(...mappedArticles);

            this.page = nextPage;
            this.hasMorePages = newArticles.length >= 12;
          } else {
            this.hasMorePages = false;
          }
        }
      } catch (error) {
        console.error("Error loading more articles:", error);
        this.hasMorePages = false;
      } finally {
        this.isLoading = false;
      }
    },
    async handleCategoryConfirm(categories) {
      this.fullPageLoading = true;
      this.selectedCategories = categories;
      this.isSettingsModalOpen = false;

      try {
        // Refresh articles with new categories
        if (this.hasSelectedCategories) {
          await this.fetchArticlesFromSelectedCategories();
        } else {
          // Clear articles if no categories selected
          this.newsItems = [];
          this.otherNewsItems = [];
          this.relatedNews = [];
        }
      } catch (error) {
        console.error("Error handling category confirmation:", error);
      } finally {
        this.fullPageLoading = false;
      }
    },
    navigateToArticle(articleId) {
      const found = [...this.newsItems, ...this.otherNewsItems, ...this.relatedNews].find((a) => a.id === articleId)
      // Add trailing slash to match the site's routing convention
      const target = `/${found.sport.toLowerCase()}/${found.slug}/`
      this.$router.push(target);
    },
  },
};
</script>

<style scoped>
.full-page-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--bg-40);
  border-top: 4px solid var(--yellow-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-white);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
  color: var(--bg-05);
  border-left: 4px solid var(--bg-05);
  padding-left: 12px;
  font-size: 24px;
}

.grid-container {
  padding-bottom: 24px;
  margin-bottom: 0;
}

.news-grid {
  gap: 24px;
  margin-bottom: 24px;
  padding-top: 20px;
  padding-bottom: 1px;
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
  margin-bottom: 16px;
  padding-bottom: 0;
}

.sidebar-header h3 {
  font-weight: 600;
  font-size: 24px;
  line-height: 26px;
  text-transform: uppercase;
  color: var(--text-white);
  border-left: 4px solid var(--text-white);
  padding-left: 12px;
  margin: 0;
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
  margin-bottom: 44px;
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

.related-news-item .category.fudbal {
  color: var(--green-primary);
}

.related-news-item .category.košarka {
  color: var(--orange-primary);
}

.related-news-item .category.tenis {
  color: var(--blue-primary);
}

.related-news-item .category.odbojka {
  color: var(--red-primary);
}

.related-news-item .category.ostali,
.related-news-item .category.ostale {
  color: var(--text-25);
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
  gap: 16px;
  color: var(--text-25);
  font-size: 15px;
}

.divider {
  flex-grow: 1;
  height: 1px;
  background: var(--bg-40);
}

.no-categories-message {
  text-align: center;
  padding: 20px;
  background-color: var(--bg-80);
  border-radius: 8px;
  margin-bottom: 24px;
  color: var(--text-25);
  font-size: 16px;
}

@media screen and (max-width: 1200px) {
  .main-column {
    min-width: 100%;
  }
}

@media screen and (max-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media screen and (max-width: 768px) {
  .loading-spinner {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }

  .loading-text {
    font-size: 16px;
  }
}
</style>
