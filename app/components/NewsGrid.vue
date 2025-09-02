<template>
  <div class="news-grid" :class="{ 'ostale-vesti-background': background }">
    <div class="section-header" v-if="title">
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
        :key="item.id || index"
        class="news-item"
        :data-index="index"
      >
        <news-card
          :title="item.title"
          :image="item.image"
          :sport="item.sport"
          :sectionType="sport"
          :id="item.id"
          :url="item.url"
          :category="item.category"
          :slug="item.slug"
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
        @click="$emit('load-more')"
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
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
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
  },
  computed: {
    responsiveColumns() {
      if (this.windowWidth <= 576) return 1;
      if (this.windowWidth <= 850) return 2;
      if (this.windowWidth <= 1200) return 3;
      return 4;
    },
    sportClass() {
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
      return {
        "grid-template-columns": `repeat(${this.responsiveColumns}, 1fr)`,
      };
    },
    filteredNews() {
      if (this.title === "OSTALE VESTI") {
        return this.news.slice(0, 8);
      }
      return this.news;
    },
    categoryRoute() {
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
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      if (typeof window !== "undefined") {
        this.windowWidth = window.innerWidth;
      }
    },
    handlePageChange({ page, id }) {
      if (page === "article") {
        this.$router.push(`/article/${id}`);
      }
    },
    handleArticleClick(articleId) {
      if (this.emitClicks) {
        console.log(articleId, "articleId");
        // Find the entire article object
        const article = this.news.find(item => item.id === articleId);
        console.log(article, "entire article object");
        // Emit the event to parent components (like SearchModal)
        this.$emit("article-clicked", articleId);
      } else {
        // Navigate directly to the article
        this.$router.push(`/article/${articleId}`);
      }
    },
    beforeEnter(el) {
      gsap.set(el, {
        opacity: 0,
        y: 30,
      });
    },
    enter(el, done) {
      const delay = el.dataset.index * 0.05;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        delay,
        ease: "power2.out",
        onComplete: done,
      });
    },
    leave(el, done) {
      gsap.to(el, {
        opacity: 0,
        y: -30,
        duration: 0.2,
        ease: "power2.in",
        onComplete: done,
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

@media screen and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 576px) {
  .news-grid {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
    margin-left: 0;
  }

  .grid-container {
    grid-template-columns: 1fr;
  }

  .ostale-vesti-background {
    padding: 0 16px;
    margin-left: -16px;
    width: 100vw;
  }
}
</style>
