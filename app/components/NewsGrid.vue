<template>
  <div class="news-grid" :class="{ 'ostale-vesti-background': background }">
    <div class="section-header" v-if="title && title.trim()">
      <div class="section-title" :class="sportClass">
        <h2>{{ title }}</h2>
      </div>
      <NuxtLink :to="categoryRoute" class="view-all">Sve vesti</NuxtLink>
    </div>
    <transition-group
      name="news-grid"
      tag="div"
      class="grid-container"
      :style="gridStyle"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div
        v-for="(item, index) in filteredNews"
        :key="(item && item.id) || `item-${index}`"
        class="news-item"
        :data-index="index"
        v-if="item"
      >
        <news-card
          :title="item.title || ''"
          :image="item.image || ''"
          :sport="item.sport || ''"
          :sectionType="sport || ''"
          :id="item.id || ''"
          :url="item.url || ''"
          :category="item.category || ''"
          :slug="item.slug || ''"
          :emitEvents="true"
          :forceShowSportTag="forceShowSportTag"
          @change-page="handlePageChange"
          @article-clicked="handleArticleClick"
        />
      </div>
    </transition-group>
    <div v-if="showLoadMore" class="load-more-container">
      <button
        class="load-more-button"
        @click="handleLoadMore"
        :disabled="loading"
      >
        <span v-if="!loading">Učitaj više</span>
        <span v-else class="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import NewsCard from "./NewsCard.vue";
import gsap from "gsap";

export default {
  name: "NewsGrid",
  components: {
    NewsCard,
  },
  data() {
    return {
      windowWidth: 1200,
      isClient: false,
    };
  },
  props: {
    title: {
      type: String,
      required: false,
      default: "",
    },
    news: {
      type: Array,
      required: true,
      default: () => [],
      validator: (value) => Array.isArray(value),
    },
    sport: {
      type: String,
      default: "NAJNOVIJE",
    },
    showLoadMore: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Number,
      default: 4,
    },
    emitClicks: {
      type: Boolean,
      default: false,
    },
    background: {
      type: Boolean,
      default: false,
    },
    forceShowSportTag: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
  },
  computed: {
    responsiveColumns() {
      if (!this.isClient) {
        return 4; // Default to desktop layout during SSR
      }
      
      const width = this.windowWidth || 1200;
      if (width <= 576) return 1;
      if (width <= 850) return 2;
      if (width <= 1200) return 3;
      return 4;
    },
    sportClass() {
      if (!this.sport || typeof this.sport !== 'string') {
        return "";
      }
      
      const sportMap = {
        FUDBAL: "football",
        KOŠARKA: "basketball",
        TENIS: "tennis",
        ODBOJKA: "volleyball",
        NAJNOVIJE: "latest",
        "OSTALE VESTI": "other",
      };
      return sportMap[this.sport] || "";
    },
    gridStyle() {
      const columns = this.responsiveColumns || 4;
      return {
        "grid-template-columns": `repeat(${columns}, 1fr)`,
      };
    },
    filteredNews() {
      if (!Array.isArray(this.news)) {
        return [];
      }
      
      if (this.title === "OSTALE VESTI") {
        return this.news.slice(0, 8);
      }
      return this.news;
    },
    categoryRoute() {
      if (!this.sport || typeof this.sport !== 'string') {
        return "/";
      }
      
      const routeMap = {
        FUDBAL: "/fudbal",
        KOŠARKA: "/kosarka",
        TENIS: "/tenis",
        ODBOJKA: "/odbojka",
        NAJNOVIJE: "/najnovije-vesti",
        "OSTALE VESTI": "/ostali-sportovi",
      };
      return routeMap[this.sport] || "/";
    },
  },
  mounted() {
    // Mark as client-side and get actual window width
    this.isClient = true;
    this.handleResize();
    
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("resize", this.handleResize);
    }
  },
  beforeUnmount() {
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("resize", this.handleResize);
    }
  },
  methods: {
    handleResize() {
      if (typeof window !== "undefined" && window.innerWidth) {
        this.windowWidth = window.innerWidth || 1200;
      }
    },
    handleLoadMore() {
      if (this.$emit) {
        this.$emit('load-more');
      }
    },
    handlePageChange(payload) {
      if (!payload || typeof payload !== 'object') {
        console.warn('Invalid payload in handlePageChange:', payload);
        return;
      }
      
      const { page, id } = payload;
      if (page === "article" && id) {
        if (this.$router && this.$router.push) {
          this.$router.push(`/article/${id}`);
        }
      }
    },
    handleArticleClick(articleId) {
      if (!articleId) {
        console.warn('No articleId provided to handleArticleClick');
        return;
      }
      
      if (this.emitClicks) {
        console.log(articleId, "articleId");
        // Find the entire article object
        const article = Array.isArray(this.news) 
          ? this.news.find(item => item && item.id === articleId)
          : null;
        console.log(article, "entire article object");
        // Emit the event to parent components (like SearchModal)
        if (this.$emit) {
          this.$emit("article-clicked", articleId);
        }
      } else {
        // Find the article first
        const article = Array.isArray(this.news) 
          ? this.news.find(item => item && item.id === articleId)
          : null;
          
        if (article && article.category && article.slug) {
          // Navigate directly to the article
          if (this.$router && this.$router.push) {
            this.$router.push(`/${article.category}/${article.slug}`);
          }
        } else {
          console.warn('Article not found or missing category/slug:', articleId);
        }
      }
    },
    beforeEnter(el) {
      if (!el || typeof gsap === 'undefined') {
        return;
      }
      
      gsap.set(el, {
        opacity: 0,
        y: 30,
      });
    },
    enter(el, done) {
      if (!el || typeof gsap === 'undefined') {
        if (typeof done === 'function') done();
        return;
      }
      
      const index = el.dataset && el.dataset.index ? parseInt(el.dataset.index) : 0;
      const delay = index * 0.05;
      
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        delay,
        ease: "power2.out",
        onComplete: typeof done === 'function' ? done : () => {},
      });
    },
    leave(el, done) {
      if (!el || typeof gsap === 'undefined') {
        if (typeof done === 'function') done();
        return;
      }
      
      gsap.to(el, {
        opacity: 0,
        y: -30,
        duration: 0.2,
        ease: "power2.in",
        onComplete: typeof done === 'function' ? done : () => {},
      });
    },
  },
};
</script>

<style scoped>
.news-grid {
  padding: 24px 20px;
  padding-right: 0;
  padding-bottom: 0;
  border-radius: 8px;
  margin-left: -20px;
  background: var(--bg-90);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.section-title {
  position: relative;
  padding-left: 12px;
  border-left: 4px solid var(--text-white);
}

.section-title.football {
  border-left-color: var(--green-primary);
}

.section-title.basketball {
  border-left-color: var(--orange-primary);
}

.section-title.tennis {
  border-left-color: var(--blue-primary);
}

.section-title.volleyball {
  border-left-color: var(--red-primary);
}

.section-title h2 {
  font-weight: 600;
  font-size: 24px;
  line-height: 26px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  color: var(--text-white);
  margin: 0;
}

.section-title.football h2 {
  color: var(--green-primary);
}

.section-title.basketball h2 {
  color: var(--orange-primary);
}

.section-title.tennis h2 {
  color: var(--blue-primary);
}

.section-title.volleyball h2 {
  color: var(--red-primary);
}

.view-all {
  margin-left: auto;
  font-weight: 600;
  font-size: 16px;
  line-height: 26px;
  text-align: right;
  letter-spacing: -0.25px;
  text-decoration: underline;
  color: var(--text-white);
  font-family: var(--actions);
}

.grid-container {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
  max-width: 100%;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
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
  font-family: var(--actions);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-90);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.load-more-button:hover {
  opacity: var(--hover);
}

.loading-dots {
  display: none;
}

.loading-dots {
  display: flex;
  gap: 2px;
}

.loading-dots span {
  animation: loadingDots 1.4s infinite;
  font-size: 20px;
  line-height: 0;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.ostale-vesti-background {
  background: var(--vertical-dark-gradient);
}

@keyframes loadingDots {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(var(--translate-y-hover));
  }
}

/* Fallback CSS for when JavaScript hasn't loaded yet */
@media screen and (max-width: 576px) {
  .news-grid {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
    margin-left: 0;
  }

  .grid-container {
    grid-template-columns: 1fr !important;
  }

  .ostale-vesti-background {
    padding: 0 16px;
    margin-left: -16px;
    width: 100vw;
  }
}

@media screen and (max-width: 850px) and (min-width: 577px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media screen and (max-width: 1200px) and (min-width: 851px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
</style>
