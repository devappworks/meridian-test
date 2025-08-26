<template>
  <transition name="slide-down">
    <div class="category-page-nav" v-if="isVisible">
      <div class="container">
        <div v-if="!isVolleyballPage" class="nav-content" ref="navContainer">
          <!-- Main category -->
          <a
            href="#"
            class="nav-item"
            :class="{
              active: isActiveCategory(menuData?.web_categories?.[0]),
            }"
            @click.prevent="selectCategory(menuData?.web_categories?.[0])"
            v-if="menuData?.web_categories?.length > 0"
          >
            SVE VESTI
          </a>

          <!-- Subcategories -->
          <a
            v-for="subMenu in validSubMenus"
            :key="subMenu.id"
            href="#"
            class="nav-item"
            :class="{ active: isActiveCategory(subMenu.web_categories?.[0]) }"
            @click.prevent="selectCategory(subMenu.web_categories?.[0])"
          >
            {{ subMenu.title }}
          </a>

          <div class="nav-underline" :style="underlineStyle"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { useSlidingUnderline } from "@/composables/useSlidingUnderline.js";

export default {
  name: "CategoryPageNav",
  emits: ["category-changed"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    menuData: {
      type: Object,
      default: null,
    },
    currentCategory: {
      type: Number,
      default: 28,
    },
  },
  setup() {
    const { underlineStyle, setContainer, setActiveItem, hideUnderline } =
      useSlidingUnderline();

    return {
      underlineStyle,
      setContainer,
      setActiveItem,
      hideUnderline,
    };
  },
  computed: {
    currentRoute() {
      return this.$route.path;
    },
    validSubMenus() {
      if (!this.menuData?.sub_menu) return [];
      return this.menuData.sub_menu.filter(
        (subMenu) => subMenu.web_categories?.length > 0
      );
    },
    isVolleyballPage() {
      return this.$route.path.includes("odbojka");
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.menuData) {
        this.setupSlidingUnderline();
      }
    });
  },
  methods: {
    isActiveRoute(routePath) {
      return this.currentRoute === routePath;
    },
    isActiveCategory(categoryId) {
      return this.currentCategory === categoryId;
    },
    selectCategory(categoryId) {
      if (categoryId && categoryId !== this.currentCategory) {
        this.$emit("category-changed", categoryId);
      }
    },
    setupSlidingUnderline() {
      const navContainer = this.$refs.navContainer;
      if (!navContainer) return;

      this.setContainer(navContainer);

      // Add a small delay to ensure DOM is fully rendered with dynamic content
      setTimeout(() => {
        this.updateActiveUnderline();
      }, 50);
    },
    updateActiveUnderline() {
      const navContainer = this.$refs.navContainer;
      if (!navContainer) {
        this.hideUnderline();
        return;
      }

      // Find the active link based on currentCategory
      const allLinks = navContainer.querySelectorAll("a");
      let activeLink = null;

      for (let link of allLinks) {
        const linkElement = link;
        // Check if this link corresponds to the current category
        if (linkElement.classList.contains("active")) {
          activeLink = linkElement;
          break;
        }
      }

      if (activeLink) {
        this.setActiveItem(activeLink);
      } else {
        this.hideUnderline();
      }
    },
  },
  watch: {
    $route() {
      this.$nextTick(() => {
        this.updateActiveUnderline();
      });
    },
    currentCategory() {
      this.$nextTick(() => {
        // Add a small delay to ensure the active class is applied
        setTimeout(() => {
          this.updateActiveUnderline();
        }, 10);
      });
    },
    menuData() {
      this.$nextTick(() => {
        this.setupSlidingUnderline();
      });
    },
  },
};
</script>

<style scoped>
.category-page-nav {
  background: var(--bg-80);
  transition: all 0.3s ease;
}

/* Expand down transition */
.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-down-enter-from {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to {
  max-height: 60px;
  opacity: 1;
}

.slide-down-leave-from {
  max-height: 60px;
  opacity: 1;
}

.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  height: 60px;
  position: relative;
}

.nav-item {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-white);
  text-decoration: none;
  text-transform: uppercase;
  padding: 8px 0;
  position: relative;
  transition: color 0.2s ease;
}

a.nav-item:hover {
  color: var(--text-white);
}

a.nav-item:active {
  opacity: 1;
}

.nav-item.active {
  font-weight: 700;
}

.nav-underline {
  position: absolute;
  bottom: 0;
  height: 3px;
  background: var(--text-white);
  transition: all 0.3s ease;
  border-radius: 1px;
}

@media screen and (max-width: 1024px) {
  .nav-content {
    gap: 24px;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .nav-content::-webkit-scrollbar {
    display: none;
  }
}
</style>
