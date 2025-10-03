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
            showLoadMore=true
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
          background=true
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
import { fetchFromApi, fetchParentCategory } from "@/services/api.js";
import { getCanonicalCategoryFromSlug } from "@/utils/canonicalCategory.js";

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
  head() {
    // Build breadcrumb schema manually (can't use composables in Options API head())
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: this.displayTitle,
          item: `https://meridiansport.rs/${this.slug || ''}`,
        },
      ],
    };

    return {
      script: [
        {
          key: 'ldjson-breadcrumb-category',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
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
    tagId: {
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
      sport: null,
      currentTagId: null,
      storedCategoryTitle: null, // Store title to persist after URL cleanup
      currentEventName: null, // Store current event listener name
      eventHandler: null, // Store bound event handler reference
      menuData: null, // Store navigation menu data
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
    tagIdFromQuery() {
      // Get tag ID from query parameters
       
      return this.$route.query.tagId || null;
    },
    displayTitle() {
      let title;

      // First priority: Get title from active navigation item
      const activeNavTitle = this.getActiveNavigationTitle();
      
      
      
      if (activeNavTitle) {
        title = activeNavTitle;
        
        return title;
      }

      // Use stored title first (persists after URL cleanup)
      if (this.storedCategoryTitle) {
        title = this.storedCategoryTitle;
        
        return title;
      }

      // Use title from query params if available
      if (this.categoryTitleFromQuery) {
        title = this.categoryTitleFromQuery;
        
        return title;
      }

      // Fallback: convert slug back to readable title with proper Serbian characters
      if (this.slug) {
        title = this.slug
          .replace(/domaca/gi, "DOMAĆA")
          .replace(/kosarka/gi, "KOŠARKA")
          .replace(/odbojka/gi, "ODBOJKA")
          .replace(/sampiona/gi, "ŠAMPIONA")
          .split("-")
          .map((word) => word.toUpperCase())
          .join(" ");
        
        return title;
      }

      title = "VESTI";
      
      return title;
    },
  },
  methods: {
    getActiveNavigationTitle() {
      // Return the title of the currently active navigation item
      if (!this.menuData) return null;

      // First, check if the menuData itself has the current categoryId
      if (this.currentCategoryId && this.menuData.web_categories &&
          this.menuData.web_categories.includes(this.currentCategoryId)) {
        return this.menuData.title;
      }

      // Check subcategories
      if (this.currentCategoryId && this.menuData.sub_menu) {
        for (const subMenu of this.menuData.sub_menu) {
          if (subMenu.web_categories && subMenu.web_categories.includes(this.currentCategoryId)) {
            return subMenu.title;
          }
        }
      }

      return null;
    },

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

    async loadMenuData() {
      // Load menu data to determine active navigation titles
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

        // Find the current menu item based on slug or categoryId
        const currentSlug = this.slug;
        let currentMenuItem = null;
        
        if (currentSlug) {
          currentMenuItem = this.findItemBySlug(helperItems, currentSlug) ||
                           this.findItemBySlug(webMenuItems, currentSlug);
        }
        
        // Store the menu data for the active navigation title lookup
        this.menuData = currentMenuItem;
        
      } catch (e) {
        console.error("Error loading menu data:", e);
        this.menuData = null;
      }
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
          
          // Extract tagId from the candidate
          const tagId = candidate.content?.[0]?.options?.tags?.[0];
          
          // Store the menu data for navigation title lookup
          this.menuData = candidate;
          
          if (Array.isArray(webCategories) && webCategories.length > 0) {
            return { 
              id: webCategories[0], 
              title: candidateTitle,
              tagId: tagId  // ✅ Add tagId to the return object
            };
          }
          // Some items might define category in sub_menu children
          if (Array.isArray(candidate.sub_menu) && candidate.sub_menu.length) {
            const childWithCategory = candidate.sub_menu.find(
              (c) => Array.isArray(c?.web_categories) && c.web_categories.length > 0
            );
            if (childWithCategory) {
              // Also try to get tagId from child
              const childTagId = childWithCategory.content?.[0]?.options?.tags?.[0];
              return {
                id: childWithCategory.web_categories[0],
                title: childWithCategory.title || candidateTitle,
                tagId: childTagId || tagId  // ✅ Use child tagId or fallback to parent
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

    getTagId() {
      // Get tag ID from props, query params, route params, or resolved from slug
      return (
        this.tagId ||
        this.tagIdFromQuery ||
        this.currentTagId ||  // ✅ Add this line to check stored tagId
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

    deriveSportFromContext() {
      // Derive sport from stored title, query params, or slug
      let sportSource = this.storedCategoryTitle || this.categoryTitleFromQuery || this.slug;
      
      if (sportSource) {
        const sportLower = sportSource.toLowerCase();
        
        if (sportLower.includes("fudbal") || sportLower.includes("football")) {
          return "fudbal";
        } else if (sportLower.includes("košarka") || sportLower.includes("basketball") || sportLower.includes("kosarka")) {
          return "kosarka";
        } else if (sportLower.includes("tenis") || sportLower.includes("tennis")) {
          return "tenis";
        } else if (sportLower.includes("odbojka") || sportLower.includes("volleyball")) {
          return "odbojka";
        } else {
          // Default to slug or a general sport identifier
          return this.slug || "default";
        }
      }
      
      return "default";
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
        category: article.categories[0].slug,
        slug: article.slug,
      };
    },

    mapSidebarArticle(article) {
      return {
        id: article.id,
        title: article.title,
        sport: this.getSportFromCategories(article.categories),
        date: article.date,
        category: article.categories[0].slug,
        slug: article.slug,
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
        /* if (this.categoryData.result.articles[0].categories[0].name.toLowerCase().includes(this.displayTitle.toLowerCase())) {
           
        } */

        // Get canonical category for comparison (e.g., "domaca-kosarka" -> "kosarka")
        const canonicalSlug = getCanonicalCategoryFromSlug(this.slug);

        // Check if any article doesn't match the canonical category
        let needsTagFetch = false;
        for (const article of categoryData.result.articles) {
          const hasMatchingCategory = article.categories.some(cat => {
            const catSlug = cat.slug?.toLowerCase() || cat.name?.toLowerCase() || '';
            const catCanonical = getCanonicalCategoryFromSlug(catSlug);

            // Check if article's canonical category matches our canonical category
            return catCanonical === canonicalSlug || catSlug === canonicalSlug;
          });

          if (!hasMatchingCategory) {
            needsTagFetch = true;
            break;
          }
        }

        // If we found an article without matching canonical category, fetch using tags
        let finalArticles = categoryData.result.articles;

        if (needsTagFetch && this.getTagId()) {
          this.currentTagId = this.getTagId();

          const tagData = await fetchFromApi("/getArticles", {
            articleLimit: 53,
            "tag[]": this.currentTagId,
          });
          finalArticles = tagData.result.articles;
        }

        const allArticles = finalArticles;

         

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
      this.sport = this.deriveSportFromContext();

      // Store the title if we have it from query params
      if (this.categoryTitleFromQuery) {
        this.storedCategoryTitle = this.categoryTitleFromQuery;
      }

      // Load menu data for navigation title lookup
      await this.loadMenuData();

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
          
          // ✅ Store the tagId if it was resolved
          if (resolved.tagId) {
            this.currentTagId = resolved.tagId;
          }
          
          if (!this.storedCategoryTitle && resolved.title) {
            this.storedCategoryTitle = resolved.title;
          }
          
          // Re-derive sport after resolving category
          this.sport = this.deriveSportFromContext();
          
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

    async initializeTag() {
      this.currentTagId = this.getTagId();
      return;
    },

    cleanUpUrl() {
      // Only clean URL if we're actually on a category page, not an article page
      const currentPath = this.$route.path;
      const isArticlePage = currentPath.includes('/') && currentPath.split('/').length > 2;
      
      // Don't clean URL if we're on an article page
      if (isArticlePage) {
        return;
      }
      
      // Remove query parameters from URL while keeping the functionality
      if (this.$route.query.categoryId || this.$route.query.title) {
        const currentSlug = this.$route.params.slug;

        // Only clean URL if we have the essential data stored
        if (
          currentSlug &&
          (this.currentCategoryId || this.storedCategoryTitle)
        ) {
          // Use browser History API instead of Vue Router to avoid triggering watchers
          
          const cleanUrl = `${this.parent_slug}`;
          window.history.replaceState(null, "", cleanUrl);
          this.parent_slug = "";
        }
      }
    },

    navigateToArticle(articleId) {
      const found = [...this.categoryNews, ...this.loadMoreCategoryNews, ...this.relatedNews].find((a) => a.id === articleId);
      const target = `/${found.category}/${found.slug}`;
      this.$router.push(target);
    },

    async getParentSlug() {
      
      
      // Check if this is a main category (like kosarka, fudbal, etc.)
      // Main categories shouldn't have parents, so return the slug itself
      const mainCategories = ['kosarka', 'fudbal', 'tenis', 'odbojka', 'ostali-sportovi'];
      
      if (mainCategories.includes(this.slug)) {
        
        return this.slug;
      }
      
      try {
        const parentCategoryData = await fetchParentCategory(`${this.slug}`);
        if (parentCategoryData && parentCategoryData.result && parentCategoryData.result.category) {
          const parent_slug = parentCategoryData.result.category.slug;
          
          return parent_slug;
        }
      } catch (error) {
        // Check if it's a 404 error
        if (error.response && error.response.status === 404) {
          
          return this.slug;
        }
        // For other errors, log and return slug as fallback
        console.error("Error fetching parent category:", error);
        
        return this.slug;
      }
      
      // Fallback if no data or other issues
      
    },

    async setupDynamicEventListener() {
      // Create dynamic event name based on current categoryId
      const eventName = `${this.sport || this.currentCategoryId || 'default'}-category-changed`;
     
      const parent_slug = await this.getParentSlug();
      // Store the event name and handler for cleanup
      this.currentEventName = eventName;
      this.eventHandler = this.handleGlobalCategoryChange.bind(this);
      
      // Add the dynamic event listener
      window.addEventListener(this.currentEventName, this.eventHandler);
      
      // Dispatch initial event to notify other components
      window.dispatchEvent(new CustomEvent(`${this.sport || this.currentCategoryId || 'default'}-category-changed`, {
        detail: { 
          categoryId: this.currentCategoryId,
          sport: this.sport ,
          parent_slug: parent_slug
        }
      }));       
    },
    
    removeDynamicEventListener() {
      // Remove the current event listener if it exists
      if (this.currentEventName && this.eventHandler) {
        window.removeEventListener(this.currentEventName, this.eventHandler);
         
      }
    },
    
    async handleGlobalCategoryChange(event) {
      const { categoryId, sport, parent_slug } = event.detail;

      console.log("EVENT RECEIVED: ", event.detail)

      // Don't handle category changes if we're not on a category page
      const currentPath = this.$route.path;
      const isArticlePage = currentPath.includes('/') && currentPath.split('/').length > 2;

      if (isArticlePage) {
        return;
      }

      // Update current category and sport information
      this.currentCategoryId = categoryId;
      this.sport = sport; // Store the sport value for future use
      this.parent_slug = parent_slug;

      // Don't overwrite storedCategoryTitle if we already have a proper title
      // Only update if we don't have a stored title yet
      if (sport && !this.storedCategoryTitle) {
        this.storedCategoryTitle = sport.toUpperCase();
      }

      // Reset all data
      this.resetNews();

      // Set loading states
      this.loading = {
        main: true,
        loadMore: false,
        other: true,
        sidebar: true,
      };

      // Fetch new data for the category
      await this.fetchCategoryArticles();

      // cleanUpUrl() is already called within fetchCategoryArticles()
    },
  },

  async mounted() {
    this.initializeCategory();
    this.initializeTag();
    
    // Add dynamic event listener based on categoryId
    await this.setupDynamicEventListener();
  },
  
  beforeUnmount() {
    // Clean up dynamic event listeners
    this.removeDynamicEventListener();
  },
  watch: {
    // Watch for route changes to handle navigation between categories
    async $route(to, from) {
      // Check if we're navigating to/from article pages
      const toIsArticle = to.path.split('/').length > 2;
      const fromIsArticle = from.path.split('/').length > 2;
      
      // Don't re-initialize if:
      // 1. Navigating from category to article (toIsArticle && !fromIsArticle)
      // 2. Navigating from article to same category (fromIsArticle && !toIsArticle && to.params.slug === from.params.slug.split('/')[0])
      // 3. Navigating between articles in same category
      if (toIsArticle || fromIsArticle) {
        return;
      }
      
      // Only re-initialize if the slug actually changed (real route change between categories)
      // Don't re-initialize for query parameter changes or same slug
      if (to.params.slug !== from.params.slug) {
        this.resetNews();
        this.storedCategoryTitle = null; // Clear stored title for new route
        
        // Remove old event listener and setup new one
        this.removeDynamicEventListener();
        this.initializeCategory();
        this.initializeTag();
        await this.setupDynamicEventListener();
      }
    },
    // Watch for prop changes
    async categoryId() {
      this.resetNews();
      this.storedCategoryTitle = null; // Clear stored title for new category
      
      // Remove old event listener and setup new one
      this.removeDynamicEventListener();
      this.initializeCategory();
      await this.setupDynamicEventListener();
    },
    tagId() {
      this.resetNews();
      this.storedCategoryTitle = null; // Clear stored title for new category
      this.initializeTag();
    },
    
    // Watch for currentCategoryId changes to update event listener
    async currentCategoryId(newCategoryId, oldCategoryId) {
      if (newCategoryId !== oldCategoryId) {
        // Remove old event listener and setup new one with updated categoryId
        this.removeDynamicEventListener();
        await this.setupDynamicEventListener();
      }
    },

    // Watch for menuData changes to trigger displayTitle update
    menuData() {
      // Force reactivity update for displayTitle when menuData changes
      this.$forceUpdate();
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
