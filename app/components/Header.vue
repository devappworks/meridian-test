<template>
  <header>
    <!-- Top navbar with logo and main navigation -->
    <div class="top-navbar">
      <div class="container">
        <div class="top-navbar-content">
          <div class="logo" @click="$router.push('/')">
            <img src="@/assets/images/meridian-logo.svg" alt="Meridian Sport" fetchpriority="high" decoding="async" width="171" height="24" />
          </div>
          <!-- Desktop Navigation -->

          <nav class="main-nav desktop-nav">
            <div class="nav-container" ref="navContainer">
              <ul>
                <li v-for="item in navigationItems" :key="item.id">
                  <router-link
                    :to="generateRouteFromHref(item.href)"
                    active-class="active"
                    exact-active-class="active"
                  >
                    {{ item.title }}
                  </router-link>
                </li>
              </ul>
              <div class="search-icon desktop" @click="toggleSearch">
                <img src="@/assets/images/search.svg" alt="Search" loading="eager" decoding="async" width="24" height="24" />
              </div>
              <div class="nav-underline" :style="underlineStyle"></div>
            </div>
          </nav>

          <div
            class="user-icon"
            v-if="isUserLoggedIn"
            @mouseenter="showUserDropdown"
            @mouseleave="hideUserDropdown"
          >
            <div class="user-icon-container">
              <i class="fa-regular fa-circle-user"></i>
              <!-- User Dropdown -->
              <div
                class="user-dropdown"
                :class="{ show: isUserDropdownVisible }"
              >
                <div class="dropdown-item" @click="goToProfile">
                  <i class="fa-regular fa-user"></i>
                  <span>Detalji profila</span>
                </div>
                <div class="dropdown-item logout-item" @click="logout">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Odjavi se</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Login Link for non-logged-in users (no dropdown) -->
          <div class="user-icon" v-else>
            <router-link to="/prijava/">
              <i class="fa-regular fa-circle-user"></i>
            </router-link>
          </div>

          <div class="search-icon" @click="toggleSearch">
            <img src="@/assets/images/search.svg" alt="Search" loading="eager" decoding="async" width="24" height="24" />
          </div>

          <!-- Burger Menu Button -->
          <div class="burger-menu" @click="toggleMobileMenu">
            <div class="burger-line" :class="{ open: isMobileMenuOpen }"></div>
            <div class="burger-line" :class="{ open: isMobileMenuOpen }"></div>
            <div class="burger-line" :class="{ open: isMobileMenuOpen }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
      <nav class="mobile-nav">
        <div class="mobile-nav-container" ref="mobileNavContainer">
          <ul>
            <li v-for="item in navigationItems" :key="item.id">
              <router-link
                :to="generateRouteFromHref(item.href)"
                active-class="active"
                @click="closeMobileMenu"
                >{{ item.title }}</router-link
              >
            </li>
            <li>
              <router-link
                :to="isUserLoggedIn ? '/account-page/' : '/prijava/'"
                active-class="active"
                @click="closeMobileMenu"
                >{{ isUserLoggedIn ? "ACCOUNT" : "LOGIN" }}</router-link
              >
            </li>
          </ul>
          <div class="mobile-nav-underline" :style="mobileUnderlineStyle"></div>
        </div>
      </nav>
    </div>

    <!-- Category Navigation -->
    <CategoryPageNav
      :is-visible="isCategoryPage"
      :menuData="currentSportMenuData"
      :currentCategory="currentSportCategory"
      @category-changed="handleCategoryChange"
    />

    <!-- Sport categories navbar -->
    <div class="sport-navbar">
      <div class="container">
        <div class="sport-navbar-content">
          <div class="slider-container">
            <!-- <div class="slider-fade-left" v-show="canScrollLeft"></div>
            <div class="slider-fade-right" v-show="canScrollRight"></div> -->
            <div
              class="sport-categories-container"
              ref="sportCategoriesContainer"
            >
              <swiper
                v-if="helperNavigationItems && helperNavigationItems.length"
                :key="helperNavigationItems.length"
                :slidesPerView="'auto'"
                :spaceBetween="8"
                :freeMode="true"
                :mousewheel="false"
                :slidesOffsetAfter="120"
                :slidesOffsetBefore="0"
                :modules="swiperModules"
                @swiper="onSwiperInit"
                @slideChange="onSlideChange"
                class="categories-swiper"
              >
                <!-- Mobile MOJE VESTI as first slide -->
                <swiper-slide class="my-news-slide mobile-my-news-slide">
                  <div
                    class="my-news slider-item mobile-my-news"
                    :class="{
                      active: $route.path === '/moje-vesti',
                      disabled: !isUserLoggedIn,
                    }"
                    @click="toggleMyNews"
                    @mouseenter="showTooltip"
                    @mouseleave="hideTooltip"
                  >
                    <img src="@/assets/images/star.svg" alt="Star" loading="eager" decoding="async" width="14" height="14" />
                    <span>MOJE VESTI</span>
                    <!-- Tooltip -->
                    <div
                      v-if="!isUserLoggedIn"
                      class="tooltip"
                      :class="{ show: isTooltipVisible }"
                    >
                      Da biste pogledali sekciju MOJE VESTI potrebno je da se
                      prijavite na svoj nalog.
                    </div>
                  </div>
                </swiper-slide>

                <swiper-slide
                  v-for="item in helperNavigationItems"
                  :key="item.id"
                >
                  <router-link
                    :to="generateHelperRouteFromTitle(item.title, item)"
                    class="category"
                    @click="onSportCategoryClick"
                  >
                    {{ item.title }}
                  </router-link>
                </swiper-slide>
              </swiper>
              <div
                class="sport-nav-underline"
                :style="sportUnderlineStyle"
              ></div>
            </div>
          </div>
          <!-- Desktop MOJE VESTI (original position) -->
          <div
            class="my-news desktop-my-news"
            :class="{
              active: $route.path === '/moje-vesti',
              disabled: !isUserLoggedIn,
            }"
            @click="toggleMyNews"
            @mouseenter="showTooltip"
            @mouseleave="hideTooltip"
          >
            <img src="@/assets/images/star.svg" alt="Star" loading="eager" decoding="async" width="21" height="21" />
            <span>MOJE VESTI</span>
            <!-- Tooltip -->
            <div
              v-if="!isUserLoggedIn"
              class="tooltip"
              :class="{ show: isTooltipVisible }"
            >
              Da biste pogledali sekciju MOJE VESTI potrebno je da se prijavite
              na svoj nalog.
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Search Modal -->
    <SearchModal 
      :isOpen="isSearchOpen"
      @close-search="closeSearch" 
    />
  </header>
</template>

<script>
import { useRouter, useRoute } from "vue-router";
import SearchModal from "./SearchModal.vue";
import CategoryPageNav from "./CategoryPageNav.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Mousewheel } from "swiper/modules";
import { useSlidingUnderline } from "@/composables/useSlidingUnderline.js";
import { fetchFromApi } from "@/services/api.js";

export default {
  name: "SiteHeader",
  components: {
    SearchModal,
    CategoryPageNav,
    Swiper,
    SwiperSlide,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Main navigation underline - hide on screens 768px and smaller
    const {
      underlineStyle,
      setContainer,
      setActiveItem,
      hideUnderline,
      updateUnderlinePosition,
      addResizeListener,
      removeResizeListener,
    } = useSlidingUnderline(768);

    // Sport categories underline - hide on screens 768px and smaller
    const {
      underlineStyle: sportUnderlineStyle,
      setContainer: setSportContainer,
      setActiveItem: setSportActiveItem,
      hideUnderline: hideSportUnderline,
      updateUnderlinePosition: updateSportUnderlinePosition,
      addResizeListener: addSportResizeListener,
      removeResizeListener: removeSportResizeListener,
    } = useSlidingUnderline(768);

    // Mobile navigation underline - hide on screens 768px and smaller
    const {
      underlineStyle: mobileUnderlineStyle,
      setContainer: setMobileContainer,
      setActiveItem: setMobileActiveItem,
      hideUnderline: hideMobileUnderline,
      updateUnderlinePosition: updateMobileUnderlinePosition,
      addResizeListener: addMobileResizeListener,
      removeResizeListener: removeMobileResizeListener,
    } = useSlidingUnderline(768);

    const toggleMyNews = () => {
      // Check if user is logged in before allowing navigation
      const userFromLocal = localStorage.getItem("user");
      const userFromSession = sessionStorage.getItem("user");
      const tokenFromLocal = localStorage.getItem("token");
      const tokenFromSession = sessionStorage.getItem("token");

      const isLoggedIn = !!(
        (userFromLocal && tokenFromLocal) ||
        (userFromSession && tokenFromSession)
      );

      if (!isLoggedIn) {
        return; // Don't navigate if user isn't logged in
      }

      if (route.path === "/moje-vesti") {
        router.push("/");
      } else {
        router.push("/moje-vesti/");
      }
    };

    return {
      toggleMyNews,
      underlineStyle,
      setContainer,
      setActiveItem,
      hideUnderline,
      updateUnderlinePosition,
      addResizeListener,
      removeResizeListener,
      sportUnderlineStyle,
      setSportContainer,
      setSportActiveItem,
      hideSportUnderline,
      updateSportUnderlinePosition,
      addSportResizeListener,
      removeSportResizeListener,
      mobileUnderlineStyle,
      setMobileContainer,
      setMobileActiveItem,
      hideMobileUnderline,
      updateMobileUnderlinePosition,
      addMobileResizeListener,
      removeMobileResizeListener,
    };
  },
  data() {
    return {
      isSearchOpen: false,
      swiper: null,
      swiperModules: [Navigation, Mousewheel],
      slidesPerView: "auto",
      isStart: true,
      isEnd: false,
      isMobileMenuOpen: false,
      isTooltipVisible: false,
      isUserLoggedIn: false,
      isUserDropdownVisible: false,
      navigationItems: [],
      helperNavigationItems: [], // Add this new property
      isNavigationLoading: true,
      hasSportCategoryClicked: false,
      // Dynamic sport menu data - will be populated based on API response
      sportMenuData: {},
      // Dynamic current categories - will be populated based on API response
      currentCategories: {},
      // Dynamic sport mapping - maps route paths to sport keys
      sportRouteMapping: {},
      // Store category listener references for cleanup
      categoryListeners: [],
    };
  },
  computed: {
    canScrollLeft() {
      return this.swiper && !this.isStart;
    },
    canScrollRight() {
      return this.swiper && !this.isEnd;
    },
    isCategoryPage() {
      // Check if current route matches navigation items with submenus
      const categoryRoutes = this.navigationItems.filter(item => item.has_submenu).map(item => item.href);
      const currentRoute = this.$route.path.split("/").pop();
      
      // First check: direct route match
      if (categoryRoutes.includes(currentRoute)) {
        return true;
      }
      
      // Second check: if we have sport menu data for the current route (category page via slug)
      if (this.currentSport && this.sportMenuData[this.currentSport]) {
        return true;
      }
      
      // Third check: check if the route has category-related query parameters
      if (this.$route.query.categoryId && this.$route.query.title) {
        return true;
      }
      
      // Fourth check: check if current route matches any sport route mapping
      const currentPath = this.$route.path;
      if (this.sportRouteMapping[currentPath]) {
        return true;
      }
      
      return false;
    },
    currentSport() {
      // Use dynamic route mapping instead of hardcoded sport map
      const mappedSport = this.sportRouteMapping[this.$route.path];
      if (mappedSport) {
        return mappedSport;
      }
      
      // If no direct mapping, try to find sport based on route query parameters or slug
      if (this.$route.query.categoryId) {
        // Find which sport menu contains this categoryId
        for (const [sportKey, menuData] of Object.entries(this.sportMenuData)) {
          if (menuData.web_categories?.includes(parseInt(this.$route.query.categoryId))) {
            return sportKey;
          }
          if (menuData.sub_menu) {
            for (const subMenu of menuData.sub_menu) {
              if (subMenu.web_categories?.includes(parseInt(this.$route.query.categoryId))) {
                return sportKey;
              }
            }
          }
        }
      }
      
      // If still no match, try to match based on route slug
      // Extract slug properly from path (handle trailing slashes)
      const pathParts = this.$route.path.split('/').filter(part => part.length > 0);
      const routeSlug = pathParts[pathParts.length - 1]; // Get the last non-empty part
      
      console.log("Header.currentSport: routeSlug:", routeSlug, "sportMenuData keys:", Object.keys(this.sportMenuData));
      
      if (routeSlug) {
        for (const [sportKey, menuData] of Object.entries(this.sportMenuData)) {
          // Check if the slug matches the menu item title
          const menuSlug = this.generateSlugFromTitle(menuData.title);
          console.log("  Checking sportKey:", sportKey, "menuSlug:", menuSlug, "match?", routeSlug === menuSlug);
          if (routeSlug === menuSlug) {
            console.log("  → MATCH! Returning sportKey:", sportKey);
            return sportKey;
          }
          
          // Check submenu items (subcategories)
          if (menuData.sub_menu) {
            for (const subMenu of menuData.sub_menu) {
              const subMenuSlug = this.generateSlugFromTitle(subMenu.title);
              if (routeSlug === subMenuSlug) {
                return sportKey; // Return parent sport key for subcategories
              }
            }
          }
        }
      }
      
      console.log("Header.currentSport: No match found, returning null");
      return null;
    },
    currentSportMenuData() {
      return this.currentSport ? this.sportMenuData[this.currentSport] : null;
    },
    currentSportCategory() {
      if (!this.currentSport) return null;
      
      const menuData = this.currentSportMenuData;
      if (!menuData) return null;
      
      // First priority: Check if we have a stored category for this sport
      // This allows subcategory selection to persist while staying on parent URL
      if (this.currentCategories[this.currentSport]) {
        return this.currentCategories[this.currentSport];
      }
      
      // Second priority: Check the route slug to determine initial category
      const pathParts = this.$route.path.split('/').filter(part => part.length > 0);
      const routeSlug = pathParts[pathParts.length - 1];
      
      // Check if we're on the main category page
      const mainSlug = this.generateSlugFromTitle(menuData.title);
      if (routeSlug === mainSlug) {
        return menuData.web_categories?.[0] || null;
      }
      
      // Check if we're on a subcategory page
      if (menuData.sub_menu) {
        for (const subMenu of menuData.sub_menu) {
          const subSlug = this.generateSlugFromTitle(subMenu.title);
          if (routeSlug === subSlug) {
            return subMenu.web_categories?.[0] || null;
          }
        }
      }
      
      // Final fallback: use main category
      return menuData.web_categories?.[0] || null;
    },
  },
  mounted() {
    window.addEventListener("resize", this.updateVisibility);
    this.checkUserLoggedIn();
    // Listen for storage changes (useful for logout or login from other tabs)
    window.addEventListener("storage", this.checkUserLoggedIn);

    // Add resize listener for underline
    this.addResizeListener();
    this.addSportResizeListener();
    this.addMobileResizeListener();

    // Fetch navigation data
    this.fetchNavigationData();
    this.fetchHelperNavigationData();

    // Setup main navigation underline after mount (like CategoryPageNav)
    this.$nextTick(() => {
      setTimeout(() => {
        this.setupSlidingUnderline();
      }, 100);
    });

    // Dynamic category listeners are now setup in processNavigationItems()
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateVisibility);
    window.removeEventListener("storage", this.checkUserLoggedIn);
    
    // Remove dynamic category listeners
    this.removeDynamicCategoryListeners();
    
    this.removeResizeListener();
    this.removeSportResizeListener();
    this.removeMobileResizeListener();
  },
  methods: {
    async fetchNavigationData() {
      try {
        this.isNavigationLoading = true;
        const response = await fetchFromApi("getWebSettings");

        if (
          response.success &&
          response.result.languages &&
          response.result.languages.length > 0
        ) {
          this.navigationItems = response.result.languages[0].web_menu || [];

          // Dynamically process all navigation items with submenus
          this.processNavigationItems();
        }
      } catch (error) {
        console.error("Error fetching navigation data:", error);
        // Fallback to hardcoded navigation if API fails
        this.navigationItems = [
          {
            id: 1,
            title: "NAJNOVIJE",
            href: "/najnovije-vesti",
            has_submenu: false,
            sub_menu: [],
          },
          {
            id: 2,
            title: "FUDBAL",
            href: "/fudbal",
            has_submenu: false,
            sub_menu: [],
          },
          {
            id: 3,
            title: "KOŠARKA",
            href: "/kosarka",
            has_submenu: false,
            sub_menu: [],
          },
          {
            id: 4,
            title: "ODBOJKA",
            href: "/odbojka",
            has_submenu: false,
            sub_menu: [],
          },
          {
            id: 5,
            title: "OSTALI SPORTOVI",
            href: "/ostali-sportovi",
            has_submenu: false,
            sub_menu: [],
          },
          {
            id: 6,
            title: "TENIS",
            href: "/tenis",
            has_submenu: false,
            sub_menu: [],
          },
          {
            id: 7,
            title: "LIVE BLOG",
            href: "/live-blog",
            has_submenu: false,
            sub_menu: [],
          },
        ];
        
        // Process fallback navigation items
        this.processNavigationItems();
      } finally {
        this.isNavigationLoading = false;
        // Don't setup underline here - it's handled in mounted() now
      }
    },

    /**
     * Dynamically process navigation items to create sport menu data and route mapping
     */
    processNavigationItems() {
      // Reset dynamic data structures
      this.sportMenuData = {};
      this.currentCategories = {};
      this.sportRouteMapping = {};

      // Process each navigation item
      this.navigationItems.forEach((menuItem) => {
        if (menuItem.has_submenu && menuItem.web_categories?.length > 0) {
          // Generate a unique key for this sport/menu item
          const sportKey = this.generateSportKey(menuItem.title);
          
          // Store menu data
          this.sportMenuData[sportKey] = menuItem;
          
          // Set initial category (first one in the list)
          this.currentCategories[sportKey] = menuItem.web_categories[0];
          
          // Create route mapping if href exists
          if (menuItem.href) {
            const routePath = this.generateRouteFromHref(menuItem.href);
            this.sportRouteMapping[routePath] = sportKey;
          }
        }
      });

      // Setup dynamic category listeners after processing navigation items
      this.setupDynamicCategoryListeners();
    },

    /**
     * Generate a consistent sport key from menu title
     */
    generateSportKey(title) {
      // Use hyphens instead of underscores to match URL slugs
      return title
        .toLowerCase()
        .replace(/š/g, "s")
        .replace(/č/g, "c")
        .replace(/ć/g, "c")
        .replace(/ž/g, "z")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "-")  // Changed from "_" to "-" to match URL format
        .replace(/[^a-z0-9-]/g, "");  // Changed to allow hyphens
    },
    async fetchHelperNavigationData() {
      try {
        const response = await fetchFromApi("getHelperNav");

        if (
          response.success &&
          response.result.languages &&
          response.result.languages.length > 0
        ) {
          const webMenu = response.result.languages[0].web_menu;
          // Find the help-nav menu item which contains the sub_menu items we need
          const helpNavItem = webMenu?.find(
            (item) => item.title === "help-nav"
          );

          if (helpNavItem && helpNavItem.sub_menu) {
            this.helperNavigationItems = helpNavItem.sub_menu;
          }
        }
      } catch (error) {
        console.error("Error fetching helper navigation data:", error);
        // Fallback to empty array if API fails
        this.helperNavigationItems = [];
      }
    },

    generateSlugFromTitle(title) {
      // Convert title to URL-friendly slug
      return title
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/š/g, "s") // Replace Serbian characters
        .replace(/č/g, "c")
        .replace(/ć/g, "c")
        .replace(/ž/g, "z")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9-]/g, "") // Remove any other special characters
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
    },

    generateHelperRouteFromTitle(title, item) {
      // Return clean paths without query parameters
      // The CategoryPage will resolve the category from the slug
      const titleUpper = title.toUpperCase();
      const dedicatedSportPages = {
        FUDBAL: "/fudbal/",
        KOŠARKA: "/kosarka/",
        ODBOJKA: "/odbojka/",
        TENIS: "/tenis/",
      };

      // If we have a dedicated sport page, use it
      if (dedicatedSportPages[titleUpper]) {
        return dedicatedSportPages[titleUpper];
      }

      // Check if this is a tag by checking if it has a non-empty content array
      // Tags have content, categories have empty content array
      const isTag = item && item.content && Array.isArray(item.content) && item.content.length > 0;
      const slug = this.generateSlugFromTitle(title);

      if (isTag) {
        // Generate clean tag URL: /tag/tagslug/
        return `/tag/${slug}/`;
      }

      // For all other categories, return clean path with slug
      return `/${slug}/`;
    },

    generateRouteFromHref(href) {
      if (!href) return "#";

      let path = '';

      // If it's already a relative path
      if (href.startsWith("/")) {
        path = href;
      }
      // If it's an absolute URL, extract the path
      else {
        try {
          const url = new URL(href);
          path = url.pathname;
        } catch (e) {
          // If URL parsing fails, it's likely a simple slug that needs a "/" prefix
          path = "/" + href;
        }
      }

      // Add trailing slash if not present (except for root)
      if (path !== '/' && !path.endsWith('/')) {
        path += '/';
      }

      return path;
    },

    toggleSearch() {
      this.isSearchOpen = !this.isSearchOpen;
    },
    closeSearch() {
      this.isSearchOpen = false;
    },
    updateVisibility() {
      this.$forceUpdate();
      if (typeof window !== "undefined") {
        this.screenWidth = window.innerWidth;
        if (this.screenWidth > 958) {
          this.isMobileMenuOpen = false;
        }
      }
    },
    onSwiperInit(swiper) {
      this.swiper = swiper;
      this.isStart = swiper.isBeginning;
      this.isEnd = swiper.isEnd;

      // Setup sport categories underline after swiper is initialized
      this.$nextTick(() => {
        this.setupSportCategoriesUnderline();
      });
    },
    onSlideChange(swiper) {
      this.isStart = swiper.isBeginning;
      this.isEnd = swiper.isEnd;
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      this.mobileMenuOpen();

      // Setup mobile navigation underline when menu is opened
      if (this.isMobileMenuOpen) {
        this.$nextTick(() => {
          this.setupMobileNavUnderline();
        });
      }
    },
    mobileMenuOpen() {
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      this.mobileMenuOpen();
    },
    showTooltip() {
      this.isTooltipVisible = true;
    },
    hideTooltip() {
      this.isTooltipVisible = false;
    },
    toggleUserLoggedIn() {
      this.isUserLoggedIn = !this.isUserLoggedIn;
    },
    checkUserLoggedIn() {
      // Check both localStorage and sessionStorage for user data
      const userFromLocal = localStorage.getItem("user");
      const userFromSession = sessionStorage.getItem("user");
      const tokenFromLocal = localStorage.getItem("token");
      const tokenFromSession = sessionStorage.getItem("token");

      // User is logged in if user data and token exist in either storage
      this.isUserLoggedIn = !!(
        (userFromLocal && tokenFromLocal) ||
        (userFromSession && tokenFromSession)
      );
    },
    showUserDropdown() {
      this.isUserDropdownVisible = true;
    },
    hideUserDropdown() {
      this.isUserDropdownVisible = false;
    },
    goToProfile() {
      this.hideUserDropdown();
      this.$router.push("/account-page/");
    },
    logout() {
      this.hideUserDropdown();

      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      this.isUserLoggedIn = false;
      this.$router.push("/");
    },
    setupSlidingUnderline() {
      const navContainer = this.$refs.navContainer;
      if (!navContainer) return;

      this.setContainer(navContainer);

      setTimeout(() => {
        this.updateActiveUnderline();
      }, 50);
    },
    updateActiveUnderline(providedPath = null) {
      const navContainer = this.$refs.navContainer;
      if (!navContainer) {
        this.hideUnderline();
        return;
      }

      // Use provided path from route watcher, or fall back to current route path
      const currentPath = providedPath || this.$route.path;
      // Hide underline on homepage
      if (currentPath === '/') {
        this.hideUnderline();
        return;
      }

      // Debug: log all links and their classes
      const allLinks = navContainer.querySelectorAll("a");

      // First try to find the active link using the custom active class
      let activeLink = navContainer.querySelector("a.active");

      // If still no active link found, manually find the matching link
      if (!activeLink) {
        // Find the link that matches the current route
        for (let link of allLinks) {
          // Get the href attribute from the router-link
          const href = link.getAttribute("href");
          if (href === currentPath) {
            activeLink = link;
            break;
          }
        }
      }

      // If still no match, try to find partial matches for nested routes
      if (!activeLink && currentPath !== "/") {
        for (let link of allLinks) {
          const href = link.getAttribute("href");
          if (href && href !== "/" && currentPath.startsWith(href)) {
            activeLink = link;
            break;
          }
        }
      }

      // NEW: If we're on a category page, find the parent sport navigation item
      if (!activeLink && this.currentSport && this.isCategoryPage) {
        const currentSportMenuData = this.currentSportMenuData;
        if (currentSportMenuData && currentSportMenuData.href) {
          // Find the navigation link that matches the current sport
          for (let link of allLinks) {
            const href = link.getAttribute("href");
            const sportHref = this.generateRouteFromHref(currentSportMenuData.href);
            if (href === sportHref) {
              activeLink = link;
              break;
            }
          }
        }
      }

      // If still no match found, try one more time with a small delay
      // This handles cases where router-link classes haven't been applied yet
      if (!activeLink) {
        setTimeout(() => {
          const finalActiveLink = navContainer.querySelector("a.active");
          
          if (finalActiveLink) {
            this.setActiveItem(finalActiveLink);
          } else {
            // Try the category page logic again with a delay
            if (this.currentSport && this.isCategoryPage) {
              const currentSportMenuData = this.currentSportMenuData;
              if (currentSportMenuData && currentSportMenuData.href) {
                const allLinksDelayed = navContainer.querySelectorAll("a");
                for (let link of allLinksDelayed) {
                  const href = link.getAttribute("href");
                  const sportHref = this.generateRouteFromHref(currentSportMenuData.href);
                  if (href === sportHref) {
                    this.setActiveItem(link);
                    return;
                  }
                }
              }
            }
            this.hideUnderline();
          }
        }, 50);
        return;
      }

      if (activeLink) {
        this.setActiveItem(activeLink);
      } else {
        this.hideUnderline();
      }
    },
    setupSportCategoriesUnderline() {
      const sportContainer = this.$refs.sportCategoriesContainer;
      if (!sportContainer) return;

      this.setSportContainer(sportContainer);

      // Use a small delay to ensure DOM is fully ready
      setTimeout(() => {
        this.updateSportActiveUnderline();
      }, 50);
    },
    updateSportActiveUnderline() {
      const sportContainer = this.$refs.sportCategoriesContainer;
      if (!sportContainer) {
        this.hideSportUnderline();
        return;
      }

      // Only show underline if user has clicked on a sport category
      if (!this.hasSportCategoryClicked) {
        this.hideSportUnderline();
        return;
      }

      // Get current route path
      const currentPath = this.$route.path;

      // First try to find the active link using router-link active class
      let activeLink = sportContainer.querySelector("a.router-link-active");

      // If no active link found, try router-link-exact-active
      if (!activeLink) {
        activeLink = sportContainer.querySelector("a.router-link-exact-active");
      }

      // If still no active link found, manually find the matching link
      if (!activeLink) {
        const allLinks = sportContainer.querySelectorAll("a");

        // Find the link that matches the current route
        for (let link of allLinks) {
          const linkTo = link.getAttribute("href");
          if (linkTo === currentPath) {
            activeLink = link;
            break;
          }
        }
      }

      // If still no match, try to find partial matches for nested routes
      if (!activeLink && currentPath !== "/") {
        const allLinks = sportContainer.querySelectorAll("a");

        for (let link of allLinks) {
          const linkTo = link.getAttribute("href");
          if (linkTo && linkTo !== "/" && currentPath.startsWith(linkTo)) {
            activeLink = link;
            break;
          }
        }
      }

      if (activeLink) {
        this.setSportActiveItem(activeLink);
      } else {
        this.hideSportUnderline();
      }
    },
    onSportCategoryClick() {
      this.hasSportCategoryClicked = true;
      // Update underline after click
      this.$nextTick(() => {
        this.updateSportActiveUnderline();
      });
    },
    setupMobileNavUnderline() {
      const mobileContainer = this.$refs.mobileNavContainer;
      if (!mobileContainer) return;

      this.setMobileContainer(mobileContainer);

      // Use a small delay to ensure DOM is fully ready
      setTimeout(() => {
        this.updateMobileActiveUnderline();
      }, 50);
    },
    updateMobileActiveUnderline() {
      const mobileContainer = this.$refs.mobileNavContainer;
      if (!mobileContainer) {
        this.hideMobileUnderline();
        return;
      }

      // Get current route path
      const currentPath = this.$route.path;

      // First try to find the active link using router-link active class
      let activeLink = mobileContainer.querySelector("a.router-link-active");

      // If no active link found, try router-link-exact-active
      if (!activeLink) {
        activeLink = mobileContainer.querySelector(
          "a.router-link-exact-active"
        );
      }

      // If still no active link found, manually find the matching link
      if (!activeLink) {
        const allLinks = mobileContainer.querySelectorAll("a");

        // Find the link that matches the current route
        for (let link of allLinks) {
          const linkTo = link.getAttribute("href");
          if (linkTo === currentPath) {
            activeLink = link;
            break;
          }
        }
      }

      // If still no match, try to find partial matches for nested routes
      if (!activeLink && currentPath !== "/") {
        const allLinks = mobileContainer.querySelectorAll("a");

        for (let link of allLinks) {
          const linkTo = link.getAttribute("href");
          if (linkTo && linkTo !== "/" && currentPath.startsWith(linkTo)) {
            activeLink = link;
            break;
          }
        }
      }

      if (activeLink) {
        this.setMobileActiveItem(activeLink);
      } else {
        this.hideMobileUnderline();
      }
    },
    handleCategoryChange(categoryId) {
      if (!this.currentSport) {
        return;
      }

      // Update the stored current category for this sport
      this.currentCategories[this.currentSport] = categoryId;

      // Find the menu item and subcategory that corresponds to this categoryId
      const currentMenuData = this.currentSportMenuData;
      let isMainCategory = false;
      let isSubcategory = false;

      if (currentMenuData) {
        // Check if it's the main category
        if (currentMenuData.web_categories && currentMenuData.web_categories.includes(categoryId)) {
          isMainCategory = true;
        } else if (currentMenuData.sub_menu) {
          // Check subcategories
          for (const subMenu of currentMenuData.sub_menu) {
            if (subMenu.web_categories && subMenu.web_categories.includes(categoryId)) {
              isSubcategory = true;
              break;
            }
          }
        }
      }

      if (!isMainCategory && !isSubcategory) {
        return;
      }

      // For CategoryPageNav clicks, we always stay on the parent category page
      // The parent category slug is the current sport's main slug
      const parentSlug = this.generateSlugFromTitle(currentMenuData.title);
      const targetPath = `/${parentSlug}/`;
      const normalizedCurrentPath = this.$route.path.endsWith('/') ? this.$route.path : `${this.$route.path}/`;
      
      // Always emit the event to update content
      const eventName = `${this.currentSport || categoryId || 'default'}-category-changed`;
      
      console.log("Header: Dispatching event:", eventName, "with categoryId:", categoryId, "currentSport:", this.currentSport);
      
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: {
            categoryId,
            sport: this.currentSport
          }
        })
      );
      
      // Check if we need to navigate to the parent category page
      const needsNavigation = normalizedCurrentPath !== targetPath;
      
      if (needsNavigation) {
        // Navigate to the parent category page after emitting event
        // Use nextTick to ensure the event is processed first
        this.$nextTick(() => {
          this.$router.push(targetPath);
        });
      }
      
      // Update main navigation underline to ensure parent sport is highlighted
      this.$nextTick(() => {
        this.updateActiveUnderline();
      });
    
    },
    /**
     * Setup dynamic category listeners for all sports
     */
    setupDynamicCategoryListeners() {
      // Store listener references for cleanup
      this.categoryListeners = [];
      
      // Create listeners for each sport in the dynamic data
      Object.keys(this.sportMenuData).forEach(sportKey => {
        const eventName = `${sportKey}-category-updated`;
        this.categoryListeners.push(eventName);
        window.addEventListener(eventName, this.handleCategoryUpdate);
      });
    },

    /**
     * Remove dynamic category listeners
     */
    removeDynamicCategoryListeners() {
      if (this.categoryListeners) {
        this.categoryListeners.forEach(eventName => {
          window.removeEventListener(eventName, this.handleCategoryUpdate);
        });
        this.categoryListeners = [];
      }
    },

    handleCategoryUpdate(event) {
      const { categoryId } = event.detail;
      const eventType = event.type;

      const sport = eventType.replace("-category-updated", "");

      if (this.currentCategories[sport] !== undefined) {
        this.currentCategories[sport] = categoryId;
      }
    },
  },
  watch: {
    $route(to, from) {
      if (to.path === "/" && from.path === "/prijava/") {
        this.checkUserLoggedIn();
      }
      // Update underline position when route changes
      // Use nextTick first, then setTimeout to ensure router-link classes are fully updated
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateActiveUnderline(to.path);
          this.updateSportActiveUnderline();
          this.updateMobileActiveUnderline();
        }, 150);
      });
    },
    navigationItems() {
      // Update underline when navigation items are loaded
      this.$nextTick(() => {
        setTimeout(() => {
          this.setupSlidingUnderline();
          this.setupSportCategoriesUnderline();
          this.setupMobileNavUnderline();
        }, 50);
      });
    },
    currentSport() {
      // Update main navigation underline when current sport changes
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateActiveUnderline();
        }, 50);
      });
    },
    isCategoryPage() {
      // Update main navigation underline when entering/leaving category pages
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateActiveUnderline();
        }, 50);
      });
    },
  },
  beforeUnmount() {
    // Clean up listeners
    this.removeResizeListener();
    this.removeSportResizeListener();
    this.removeMobileResizeListener();
    window.removeEventListener("resize", this.updateVisibility);
    window.removeEventListener("storage", this.checkUserLoggedIn);
  },
};
</script>
<style scoped>
body {
  overflow: auto;
}

header {
  position: sticky;
  top: 0;
  z-index: 100;
}

a:hover {
  color: inherit;
}

.top-navbar {
  background: var(--red-gradient);
  padding: 10px 20px;
  height: 100%;
  max-height: 60px;
  /* Ensure header content stays above the mobile drawer on iOS */
  position: relative;
  z-index: 200;
}

.top-navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 171.25px;
  height: 24px;
  cursor: pointer;
}

.main-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  width: max-content;
}

.nav-container {
  position: relative;
  display: flex;
  gap: 24px;
}

.main-nav ul {
  display: flex;
  gap: 24px;
  list-style: none;
  order: 2;
  margin-bottom: 0;
  padding-left: 0;
}

.main-nav a {
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-white);
  text-transform: uppercase;
  padding: 8px 0;
  transition: var(--transition);
}

.main-nav a:active,
.main-nav a:focus {
  opacity: 1;
}

.main-nav a.active {
  color: var(--text-white);
  font-weight: 700;
}

.nav-underline {
  position: absolute;
  bottom: 0px;
  height: 3px;
  background: var(--text-white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
  transform-origin: left;
  z-index: 10;
}

.search-icon {
  display: none;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.search-icon.desktop {
  display: flex;
  order: 1;
}

.user-icon {
  display: flex;
  height: 24px;
  cursor: pointer;
  transition: var(--transition);
}

.user-icon i {
  font-size: 24px;
  color: var(--text-white);
}

.user-icon .svg-inline--fa.fa-arrow-right-from-bracket {
  color: var(--red-primary);
}

.user-icon-container {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: -9px;
  background-color: var(--bg-90);
  border: 1px solid var(--bg-20);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 8px 0;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  transform-origin: top right;
  min-width: 160px;
  white-space: nowrap;
}

.user-dropdown::before {
  content: "";
  position: absolute;
  top: -8px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--bg-20);
}

.user-dropdown::after {
  content: "";
  position: absolute;
  top: -7px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--bg-90);
}

.user-dropdown.show {
  opacity: 1;
  visibility: visible;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: var(--transition);
  border-radius: 4px;
}

.dropdown-item:hover {
  background-color: var(--bg-80);
}

.dropdown-item i {
  font-size: 16px;
  color: var(--text-white);
}

.dropdown-item span {
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-white);
}

.logout-item i {
  color: var(--red-primary);
}

.logout-item:hover {
  background-color: rgba(209, 17, 1, 0.1);
}

.sport-navbar {
  background-color: var(--bg-90);
  padding: 16px;
}

.sport-navbar-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
}

.slider-container {
  position: relative;
  flex: 1;
  max-width: fit-content;
  overflow: hidden;
}

.categories-swiper {
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-70);
  border-radius: 8px;
  padding: 4px 32px;
}

.slider-fade-left,
.slider-fade-right {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 100px;
  pointer-events: none;
  z-index: 2;
  border-radius: 8px;
}

.slider-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-70), transparent);
}

.slider-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-70), transparent);
}

.sport-categories-container {
  position: relative;
  width: 100%;
}

.sport-nav-underline {
  position: absolute;
  bottom: 4px;
  height: 3px;
  background: var(--text-white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
  transform-origin: left;
  z-index: 3;
}

:deep(.swiper-wrapper) {
  gap: 32px;
}

.custom-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: var(--transition);
}

.custom-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.custom-prev {
  left: -12px;
}

.custom-next {
  right: -12px;
}

.category {
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  color: var(--text-white);
  padding: 8px 12px;
  border-radius: 8px;
  transition: var(--transition);
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  background-color: var(--bg-70);
  border: 1px solid transparent;
}

:deep(.swiper-slide) {
  width: auto !important;
  flex-shrink: 0;
  margin-right: 0 !important;
}

/* MOJE VESTI within slider styles */
.my-news.slider-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: var(--bg-70);
  border: 1px solid var(--bg-20);
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  position: relative;
}

.my-news.slider-item:hover {
  background-color: var(--bg-80);
}

.my-news.slider-item.disabled:hover {
  background-color: var(--bg-70);
  cursor: not-allowed;
}

.my-news.slider-item img {
  width: 14px;
  height: 14px;
}

.my-news.slider-item span {
  font-weight: 400;
  font-size: 14px;
  color: var(--bg-05);
  line-height: 0.5;
}

.my-news.slider-item.active {
  background-color: var(--bg-20);
  border-color: var(--bg-20);
}

.my-news.slider-item.active span {
  color: var(--text-white);
}

.my-news-slide .tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-50);
  color: var(--text-white);
  padding: 10px;
  border-radius: 8px;
  font-family: var(--actions);
  font-size: 14px;
  line-height: 1.4;
  white-space: normal;
  border: 1px solid var(--bg-20);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  z-index: 1000;
  width: 290px;
}

.my-news-slide .tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--bg-20);
}

.my-news-slide .tooltip.show {
  opacity: 1;
  visibility: visible;
}

/* Hide mobile MOJE VESTI by default (desktop) */
.mobile-my-news-slide {
  display: none;
}

/* Desktop MOJE VESTI (original styles) */
.desktop-my-news {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background-color: var(--bg-70);
  border: 1px solid var(--bg-20);
  border-radius: 8px;
  cursor: pointer;
  margin-left: 8px;
  transition: var(--transition);
  position: relative;
}

.desktop-my-news:hover {
  background-color: var(--bg-80);
}

.desktop-my-news.disabled:hover {
  background-color: var(--bg-70);
  cursor: not-allowed;
}

.desktop-my-news span {
  font-weight: 400;
  font-size: 14px;
  color: var(--bg-05);
}

.desktop-my-news img {
  width: 21px;
  height: auto;
}

.desktop-my-news.active {
  background-color: var(--bg-20);
  border-color: var(--bg-20);
}

.desktop-my-news.active span {
  color: var(--text-white);
}

/* Desktop tooltip styles */
.desktop-my-news .tooltip {
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-50);
  color: var(--text-white);
  padding: 10px;
  border-radius: 8px;
  font-family: var(--actions);
  font-size: 14px;
  line-height: 1.4;
  white-space: normal;
  border: 1px solid var(--bg-20);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  z-index: 1000;
  margin-bottom: 8px;
  width: 290px;
}

.desktop-my-news .tooltip::after {
  content: "";
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: var(--bg-20);
}

.desktop-my-news .tooltip.show {
  opacity: 1;
  visibility: visible;
  transition: var(--transition);
}

.search-icon:hover {
  opacity: var(--hover);
  transition: var(--transition);
}

.sport-navbar-content .swiper .swiper-wrapper {
  gap: 32px;
  padding: 0 32px;
}

/* Burger Menu Styles */
.burger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
  z-index: 101;
}

.burger-line {
  width: 100%;
  height: 2px;
  background-color: var(--text-white);
  transition: var(--transition);
}

.burger-line.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.burger-line.open:nth-child(2) {
  opacity: 0;
}

.burger-line.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Mobile Menu Styles */
.mobile-menu {
  position: fixed;
  /* Anchor below the header instead of relying on 100vh (iOS Safari quirk) */
  top: calc(60px + env(safe-area-inset-top));
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  background-color: var(--bg-90);
  transform: translateX(-100%);
  transition: var(--transition);
  z-index: 99;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-menu.open {
  transform: translateX(0);
}

.user-dropdown svg {
  font-size: 16px;
  height: 16px;
}

/* Use dynamic viewport height when supported for more accurate sizing */
@supports (height: 100dvh) {
  .mobile-menu {
    height: calc(100dvh - (60px + env(safe-area-inset-top)));
  }
}

.mobile-nav {
  padding: 20px;
}

.mobile-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav a {
  font-size: 18px;
  color: var(--text-white);
  text-decoration: none;
  display: block;
  padding: 12px 0;
  border-bottom: 1px solid var(--bg-70);
}

.mobile-nav a.active {
  color: var(--text-white);
  font-weight: 700;
}

.mobile-nav-container {
  position: relative;
}

.mobile-nav-underline {
  position: absolute;
  height: 3px;
  background: var(--text-white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
  transform-origin: left;
}

@media screen and (max-width: 1250px) {
  .main-nav {
    position: static;
    transform: none;
  }
}

@media screen and (max-width: 958px) {
  .desktop-nav {
    display: none;
  }

  .burger-menu {
    display: flex;
    order: 1;
  }

  .top-navbar-content {
    justify-content: space-between;
  }

  .logo {
    order: 2;
  }

  .search-icon.desktop {
    display: none;
  }

  .search-icon {
    display: flex;
    position: static;
    order: 3;
  }

  .user-icon {
    display: none;
  }

  .user-dropdown {
    right: -20px;
    min-width: 140px;
  }

  .user-dropdown::before,
  .user-dropdown::after {
    right: 32px;
  }
}

@media screen and (max-width: 768px) {
  *:hover {
    opacity: 1;
  }

  .mobile-my-news-slide {
    display: none;
  }

  .desktop-my-news {
    display: flex;
  }

  .main-nav {
    display: none;
  }

  .sport-navbar-content {
    gap: 16px;
    flex-wrap: wrap;
  }

  .slider-container {
    width: 100%;
    min-width: 300px;
    margin: 0;
  }

  .categories-swiper {
    padding: 0;
    background-color: transparent;
    border-radius: 0;
  }

  .desktop-my-news {
    display: none;
  }

  .mobile-my-news-slide {
    display: block;
  }

  :deep(.swiper-wrapper) {
    gap: 8px;
  }

  .category.router-link-active,
  .category.router-link-exact-active {
    border-color: var(--bg-20);
  }
}
</style>
