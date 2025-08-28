<template>
  <div class="category-page">
    <div class="content-wrapper">
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">{{ displayTitle }}</h2>
        </div>

        <!-- Main Category News Grid -->
        <SkeletonNewsGrid v-if="loading.main" :columns="4" />
        <NewsGrid v-else :sport="displayTitle" :news="categoryNews" />

        <LiveStream />

        <div v-if="!loading.main">
          <NewsGrid
            :sport="displayTitle"
            :news="loadMoreCategoryNews"
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
import NewsGrid from "@/components/NewsGrid.vue";
import NewsletterForm from "@/components/Newsletter.vue";
import AdBanners from "@/components/AdBanners.vue";
import LiveStream from "@/components/LiveStream.vue";
import SkeletonNewsGrid from "@/components/skeletons/SkeletonNewsGrid.vue";
import SkeletonRelatedNews from "@/components/skeletons/SkeletonRelatedNews.vue";
import { fetchFromApi } from "@/services/api.js";

export default {
  name: "CategoryPage",
  components: {
    NewsGrid,
    NewsletterForm,
    AdBanners,
    LiveStream,
    SkeletonNewsGrid,
    SkeletonRelatedNews,
  },
  props: {
    slug: {
      type: String,
      required: false,
    },
    categoryId: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      categoryNews: [],
      loadMoreCategoryNews: [],
      otherNews: [],
      relatedNews: [],
      currentPage: 1,
      isLoading: false,
      hasMorePages: true,
      currentCategoryId: null,
      storedCategoryTitle: null, // Store title to persist after URL cleanup
      loading: {
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      },
    };
  },
  computed: {
    categoryTitleFromQuery() {
      // Get title from query parameters (passed from header navigation)
      return this.$route.query.title || null;
    },
    categoryIdFromQuery() {
      // Get category ID from query parameters
      return this.$route.query.categoryId || null;
    },
    displayTitle() {
      // Use stored title first (persists after URL cleanup)
      if (this.storedCategoryTitle) {
        return this.storedCategoryTitle;
      }

      // Use title from query params if available
      if (this.categoryTitleFromQuery) {
        return this.categoryTitleFromQuery;
      }

      // Fallback: convert slug back to readable title
      if (this.slug) {
        return this.slug
          .split("-")
          .map((word) => word.toUpperCase())
          .join(" ");
      }

      return "VESTI";
    },
  },
  methods: {
    slugifyTitle(title) {
      // Mirror header's slug generation for reliable matching
      return title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/š/g, "s")
        .replace(/č/g, "c")
        .replace(/ć/g, "c")
        .replace(/ž/g, "z")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    },

    findItemBySlug(items, targetSlug) {
      if (!Array.isArray(items)) return null;
      for (const item of items) {
        if (item && item.title && this.slugifyTitle(item.title) === targetSlug) {
          return item;
        }
        if (item && Array.isArray(item.sub_menu)) {
          const foundInSub = this.findItemBySlug(item.sub_menu, targetSlug);
          if (foundInSub) return foundInSub;
        }
      }
      return null;
    },

    async resolveCategoryFromSlug(slug) {
      try {
        const [helperNavRes, webSettingsRes] = await Promise.all([
          fetchFromApi("getHelperNav"),
          fetchFromApi("getWebSettings"),
        ]);

        // Helper nav: locate the 'help-nav' container and search its sub_menu
        let helperItems = [];
        if (
          helperNavRes?.success &&
          helperNavRes.result?.languages &&
          helperNavRes.result.languages.length > 0
        ) {
          const helpMenu = helperNavRes.result.languages[0].web_menu?.find(
            (it) => it.title === "help-nav"
          );
          if (helpMenu && Array.isArray(helpMenu.sub_menu)) {
            helperItems = helpMenu.sub_menu;
          }
        }

        // Main web settings menu items
        let webMenuItems = [];
        if (
          webSettingsRes?.success &&
          webSettingsRes.result?.languages &&
          webSettingsRes.result.languages.length > 0
        ) {
          webMenuItems = webSettingsRes.result.languages[0].web_menu || [];
        }

        // Search helper items first, then web menu
        const candidate =
          this.findItemBySlug(helperItems, slug) ||
          this.findItemBySlug(webMenuItems, slug);

        if (candidate) {
          const candidateTitle = candidate.title;
          const webCategories = candidate.web_categories;
          if (Array.isArray(webCategories) && webCategories.length > 0) {
            return { id: webCategories[0], title: candidateTitle };
          }
          // Some items might define category in sub_menu children
          if (Array.isArray(candidate.sub_menu) && candidate.sub_menu.length) {
            const childWithCategory = candidate.sub_menu.find(
              (c) => Array.isArray(c?.web_categories) && c.web_categories.length > 0
            );
            if (childWithCategory) {
              return {
                id: childWithCategory.web_categories[0],
                title: childWithCategory.title || candidateTitle,
              };
            }
          }
        }
      } catch (e) {
        console.error("Error resolving category from slug:", e);
      }
      return null;
    },

    getCategoryId() {
      // Get category ID from props, query params, or route params
      return (
        this.categoryId ||
        this.categoryIdFromQuery ||
        this.$route.query.category ||
        this.$route.params.categoryId ||
        null
      );
    },

    getCategoryClass(sport) {
      // Use the sport parameter if provided, otherwise use displayTitle
      const titleToCheck = sport || this.displayTitle;
      const titleLower = titleToCheck.toLowerCase();

      if (
        titleLower.includes("fudbal") ||
        titleLower.includes("liga") ||
        titleLower.includes("crvena") ||
        titleLower.includes("partizan")
      ) {
        return "football";
      } else if (titleLower.includes("košarka")) {
        return "basketball";
      } else if (titleLower.includes("tenis")) {
        return "tennis";
      } else if (titleLower.includes("odbojka")) {
        return "volleyball";
      }
      return "latest";
    },

    getSportFromCategories(categories) {
      const sportMap = {
        Fudbal: "FUDBAL",
        Košarka: "KOŠARKA",
        Tenis: "TENIS",
        Odbojka: "ODBOJKA",
      };

      const sportCategory = categories.find((cat) => sportMap[cat.name]);
      return sportCategory ? sportMap[sportCategory.name] : this.displayTitle;
    },

    mapArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: this.getSportFromCategories(article.categories),
        date: article.date,
        url: article.url,
        image: article.feat_images["medium"]
          ? article.feat_images["medium"].url
          : null,
      };
    },

    mapSidebarArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: this.getSportFromCategories(article.categories),
        date: article.date,
      };
    },

    async fetchCategoryArticles() {
      this.loading = {
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      };

      try {
        const categoryData = await fetchFromApi("/getArticles", {
          articleLimit: 53,
          "category[]": this.currentCategoryId,
        });

        const allArticles = categoryData.result.articles;

        if (allArticles.length > 0) {
          // Main category news grid (first 12 articles)
          this.categoryNews = allArticles.slice(0, 12).map(this.mapArticle);

          this.loadMoreCategoryNews = allArticles
            .slice(12, 24)
            .map(this.mapArticle);

          // Other news
          this.otherNews = allArticles.slice(24, 48).map(this.mapArticle);

          // Related news sidebar (last 5 articles)
          this.relatedNews = allArticles
            .slice(48, 53)
            .map(this.mapSidebarArticle);

          // Check if we have more pages
          this.hasMorePages = allArticles.length >= 53;
          this.currentPage = 1;
        } else {
          this.resetNews();
        }

        this.loading = {
          main: false,
          loadMore: false,
          other: false,
          sidebar: false,
        };

        // Clean up URL after successful article fetch
        this.cleanUpUrl();
      } catch (error) {
        console.error("Error fetching category articles:", error);
        this.resetNews();
        this.loading = {
          main: false,
          loadMore: false,
          other: false,
          sidebar: false,
        };

        // Still clean up URL even if fetch fails (to avoid ugly URLs)
        this.cleanUpUrl();
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
            "category[]": this.currentCategoryId,
            page: currentPage,
          });
          console.log(response, "response");

          const newArticles = response.result.articles;

          if (newArticles.length > 0) {
            // Get all existing URLs to check for duplicates
            const existingUrls = new Set([
              ...this.categoryNews.map((article) => article.url),
              ...this.loadMoreCategoryNews.map((article) => article.url),
            ]);

            // Filter out any articles that we've already shown
            const uniqueNewArticles = newArticles.filter(
              (article) => !existingUrls.has(article.url)
            );

            const mappedArticles = uniqueNewArticles.map(this.mapArticle);

            if (mappedArticles.length > 0) {
              // Found unique articles, add them and exit the loop
              this.loadMoreCategoryNews = [
                ...this.loadMoreCategoryNews,
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
      this.categoryNews = [];
      this.loadMoreCategoryNews = [];
      this.otherNews = [];
      this.relatedNews = [];
      this.currentPage = 1;
      this.hasMorePages = true;
      // Note: Don't clear storedCategoryTitle here as it needs to persist for the current page
    },

    async initializeCategory() {
      // Store essential data before URL cleanup
      this.currentCategoryId = this.getCategoryId();

      // Store the title if we have it from query params
      if (this.categoryTitleFromQuery) {
        this.storedCategoryTitle = this.categoryTitleFromQuery;
      }

      // Fetch articles first, then clean up URL after successful load
      if (this.currentCategoryId) {
        this.fetchCategoryArticles();
        return;
      }

      // Fallback: derive category from slug if available
      if (this.slug) {
        const resolved = await this.resolveCategoryFromSlug(this.slug);
        if (resolved && resolved.id) {
          this.currentCategoryId = resolved.id;
          if (!this.storedCategoryTitle && resolved.title) {
            this.storedCategoryTitle = resolved.title;
          }
          this.fetchCategoryArticles();
          return;
        }
      }

      // If no category ID could be determined, show empty UI state
      this.resetNews();
      this.loading = {
        main: false,
        loadMore: false,
        other: false,
        sidebar: false,
      };
    },

    cleanUpUrl() {
      // Remove query parameters from URL while keeping the functionality
      if (this.$route.query.categoryId || this.$route.query.title) {
        const currentSlug = this.$route.params.slug;

        // Only clean URL if we have the essential data stored
        if (
          currentSlug &&
          (this.currentCategoryId || this.storedCategoryTitle)
        ) {
          // Use browser History API instead of Vue Router to avoid triggering watchers
          const cleanUrl = `/sport/${currentSlug}`;
          window.history.replaceState(null, "", cleanUrl);
        }
      }
    },

    navigateToArticle(articleId) {
      this.$router.push(`/article/${articleId}`);
    },
  },
  mounted() {
    this.initializeCategory();
  },
  watch: {
    // Watch for route changes to handle navigation between categories
    $route(to, from) {
      // Only re-initialize if the slug actually changed (real route change)
      // Don't re-initialize for query parameter changes or same slug
      if (to.params.slug !== from.params.slug) {
        this.resetNews();
        this.storedCategoryTitle = null; // Clear stored title for new route
        this.initializeCategory();
      }
    },
    // Watch for prop changes
    categoryId() {
      this.resetNews();
      this.storedCategoryTitle = null; // Clear stored title for new category
      this.initializeCategory();
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

/* Remove all custom layout styles - use global ones from App.vue instead */
</style>
