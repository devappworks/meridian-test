<template>
  <div class="news-slider" :class="{ 'special-gradient': sport === 'TENIS' }">
    <div class="section-header">
      <div class="section-title" :class="sportClass">
        <h2>{{ title }}</h2>
      </div>
      <NuxtLink :to="`${categoryRoute}`" class="view-all">Sve vesti</NuxtLink>
    </div>
    <div class="slider-container">
      <div class="slider-fade-left" v-show="canScrollLeft"></div>
      <div class="slider-fade-right" v-show="canScrollRight"></div>

      <div
        class="custom-nav custom-prev"
        v-show="canScrollLeft"
        @click="prevSlide"
      >
        <svg
          width="8"
          height="12"
          viewBox="0 0 8 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 1L1 6L7 11"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <swiper
        :slidesPerView="slidesPerView"
        :spaceBetween="24"
        :mousewheel="false"
        :modules="swiperModules"
        @swiper="onSwiperInit"
        @slideChange="onSlideChange"
        class="news-swiper"
      >
        <swiper-slide v-for="(item, index) in news" :key="index">
          <div class="news-card" @click.stop="navigateToArticle(item)">
            <div class="news-image">
              <picture>
                <source
                  v-if="getWebpUrl(item)"
                  type="image/webp"
                  :srcset="getWebpUrl(item)"
                />
                <img
                  :src="item.image"
                  :alt="item.title"
                  draggable="false"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="225"
                />
              </picture>
            </div>
            <div class="news-content">
              <h3 class="news-title">{{ item.title }}</h3>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <div
        class="custom-nav custom-next"
        v-show="canScrollRight"
        @click="nextSlide"
      >
        <svg
          width="8"
          height="12"
          viewBox="0 0 8 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 11L7 6L1 1"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Mousewheel, Keyboard } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default {
  name: "NewsSlider",
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    // image prop is unused in this implementation; keep optional for backwards-compat.
    image: {
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
    category: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentSlide: 0,
      slidesCount: 0,
      swiper: null,
      swiperModules: [Navigation, Mousewheel, Keyboard],
      slidesPerView: 4,
    };
  },
  computed: {
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
    isAtFirstSlide() {
      return this.currentSlide === 0;
    },
    isAtLastSlide() {
      return this.currentSlide >= this.slidesCount - this.visibleSlides;
    },
    visibleSlides() {
      // Default to 4 slides, adjust based on screen width
      if (window.innerWidth >= 1024) return 4;
      if (window.innerWidth >= 768) return 3;
      if (window.innerWidth >= 576) return 2;
      return 1;
    },
    canScrollLeft() {
      return this.currentSlide > 0;
    },
    canScrollRight() {
      return this.currentSlide < this.slidesCount - 1;
    },
    categoryRoute() {
      const routeMap = {
        FUDBAL: "/fudbal/",
        KOŠARKA: "/kosarka/",
        TENIS: "/tenis/",
        ODBOJKA: "/odbojka/",
        NAJNOVIJE: "/najnovije-vesti/",
        "OSTALE VESTI": "/ostali-sportovi/",
      };
      return routeMap[this.sport] || "/";
    },
  },
  mounted() {
    // Initialize slide count
    this.slidesCount = this.news.length;

    // Add event listener for window resize
    window.addEventListener("resize", this.updateVisibility);

    // Update slidesPerView based on screen width
    this.updateSlidesPerView();

    // Initial update after component is mounted
    this.$nextTick(() => {
      this.updateVisibility();
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateVisibility);
  },
  methods: {
    getWebpUrl(item) {
      // Try to get WebP URL from featImages
      if (item.featImages?.small?.webp) {
        return item.featImages.small.webp;
      }
      if (item.featImages?.medium?.webp) {
        return item.featImages.medium.webp;
      }
      return null;
    },
    getSportClass(sport) {
      const sportMap = {
        FUDBAL: "football",
        KOŠARKA: "basketball",
        TENIS: "tennis",
        ODBOJKA: "volleyball",
        NAJNOVIJE: "latest",
        "OSTALE VESTI": "other",
        NAJNOVIJE: "latest",
        "OSTALE VESTI": "other",
      };
      return sportMap[sport] || "";
    },
    updateVisibility() {
      this.slidesCount = this.news.length;
      this.updateSlidesPerView();

      // Force a re-evaluation of scroll capabilities
      this.$forceUpdate();
    },
    updateSlidesPerView() {
      if (window.innerWidth >= 1024) {
        this.slidesPerView = 4;
      } else if (window.innerWidth >= 768) {
        this.slidesPerView = 3;
      } else if (window.innerWidth >= 576) {
        this.slidesPerView = 2;
      } else {
        this.slidesPerView = 1.4;
      }
    },
    onSwiperInit(swiper) {
      this.swiper = swiper;
      this.updateCurrentSlide(swiper.activeIndex);
    },
    onSlideChange(swiper) {
      this.updateCurrentSlide(swiper.activeIndex);
    },
    updateCurrentSlide(slideIndex) {
      this.currentSlide = slideIndex;
    },
    prevSlide() {
      if (this.swiper) {
        this.swiper.slidePrev();
      }
    },
    nextSlide() {
      if (this.swiper) {
        this.swiper.slideNext();
      }
    },
    resolveArticleRoute(rawUrl, fallbackId) {
      // Normalize incoming URLs to internal app routes
      if (!rawUrl || rawUrl === '#') {
        return fallbackId ? `/article/${fallbackId}` : '/';
      }
      try {
        const u = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const p = u.pathname || '/';
        const match = p.match(/^\/article\/(\d+)(?:\/.+)?$/i);
        if (match) return `/article/${match[1]}`;
        return p.startsWith('/') ? p : `/${p}`;
      } catch {
        const p = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        const match = p.match(/^\/article\/(\d+)(?:\/.+)?$/i);
        if (match) return `/article/${match[1]}`;
        return p;
      }
    },
    navigateToArticle(item) {
      console.log("🟡 NewsSlider card clicked!", {
        id: item?.id,
        title: item?.title,
        url: item?.url,
        sport: item?.sport || item?.category,
        category: item?.category,
        slug: item?.slug,
        sliderSport: this.sport
      });
      
      if (item && item.id) {
        // Map slider sport to URL category
        const sportToCategory = {
          'FUDBAL': 'fudbal',
          'KOŠARKA': 'kosarka', 
          'TENIS': 'tenis',
          'ODBOJKA': 'odbojka',
          'NAJNOVIJE': 'najnovije-vesti',
          'OSTALE VESTI': 'ostali-sportovi'
        };
        
        const categorySlug = sportToCategory[this.sport] || 'najnovije-vesti';
        console.log(this.sport, "CATEGORY SLUG");
        const target = `/${categorySlug}/${item.slug}/`;

        console.log("🟡 NewsSlider navigating to:", target, "from sport:", this.sport);
        this.$router.push(target);
      }
    },
  },
};
</script>

<style scoped>
.news-slider {
  padding: 26px 0;
}

.news-slider.special-gradient {
  background: var(--vertical-dark-gradient);
  border-radius: 8px;
  padding: 10px 0 10px 20px;
  margin-left: -20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 24px;
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
}

.slider-container {
  width: 100%;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.slider-fade-left,
.slider-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100px;
  pointer-events: none;
  z-index: 10;
}

.slider-fade-left {
  left: 0;
  background: linear-gradient(
    90deg,
    var(--bg-90) 0%,
    rgba(16, 24, 28, 0) 118.22%
  );
}

.slider-fade-right {
  right: 0;
  background: linear-gradient(
    270deg,
    var(--bg-90) 0%,
    rgba(16, 24, 28, 0) 118.22%
  );
}

.news-slider.special-gradient .slider-fade-right {
  right: 0;
  background: linear-gradient(
    289.52deg,
    #1c2e37 4.44%,
    rgba(16, 24, 28, 0) 66.11%
  );
}

.news-slider.special-gradient .slider-fade-left {
  left: 0;
  background: linear-gradient(70deg, #1c2e37 4.44%, rgba(16, 24, 28, 0) 66.11%);
}

.slider-fade-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80px;
  pointer-events: none;
  z-index: 5;
  background: linear-gradient(
    to top,
    var(--bg-90) 0%,
    rgba(16, 24, 28, 0.7) 60%,
    rgba(16, 24, 28, 0) 100%
  );
}

.news-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  height: 100%;
  transition: var(--transition);
}

.news-card:hover {
  transform: translateY(var(--translate-y-hover));
}

.news-image {
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: linear-gradient(
    to top,
    rgba(16, 24, 28, 0.8) 0%,
    rgba(16, 24, 28, 0.3) 70%,
    rgba(16, 24, 28, 0) 100%
  );
  pointer-events: none;
}

.category-tag {
  position: absolute;
  left: 4px;
  bottom: 4px;
}

.news-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  position: relative;
  z-index: 6;
}

.news-title {
  font-family: var(--title);
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  color: var(--text-white);
  margin-top: 8px;
}

/* Custom navigation styling */
.custom-nav {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: var(--text-white);
  border: none;
  position: absolute;
  top: 40px;
  transform: translateY(50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  transition: all 0.2s ease;
  padding: 0;
}

.custom-nav:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.custom-nav svg path {
  stroke-width: 2.5;
}

.custom-prev {
  left: 8px;
}

.custom-next {
  right: 8px;
}

.swiper {
  padding-top: 24px;
}

@media screen and (max-width: 1024px) {
  .slider-container {
    padding: 0;
  }

  .custom-nav {
    width: 32px;
    height: 32px;
  }

  .slider-fade-left,
  .slider-fade-right {
    width: 80px;
  }

  .slider-fade-left {
    background: linear-gradient(
      to right,
      var(--bg-90) 0%,
      rgba(16, 24, 28, 0.9) 30%,
      rgba(16, 24, 28, 0.4) 80%,
      rgba(16, 24, 28, 0) 100%
    );
  }

  .slider-fade-right {
    background: linear-gradient(
      to left,
      var(--bg-90) 0%,
      rgba(16, 24, 28, 0.9) 30%,
      rgba(16, 24, 28, 0.4) 80%,
      rgba(16, 24, 28, 0) 100%
    );
  }

  .slider-fade-bottom {
    height: 70px;
  }

  .news-slider.special-gradient {
    padding: 24px 12px;
    margin: 0 -12px;
  }
}

@media screen and (max-width: 576px) {
  .slider-container {
    padding: 0;
  }

  .custom-nav {
    width: 28px;
    height: 28px;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .slider-fade-left,
  .slider-fade-right {
    display: none;
  }

  .slider-fade-bottom {
    height: 60px;
  }

  .news-slider.special-gradient {
    padding: 24px 8px;
    margin: 0 -8px;
  }
}
</style>
