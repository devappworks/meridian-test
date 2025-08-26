<template>
  <div class="match-odds-slider">
    <div class="slider-container">
      <div class="slider-fade-left" v-show="canScrollLeft"></div>
      <div class="slider-fade-right" v-show="canScrollRight"></div>
      <swiper
        :slidesPerView="slidesPerView"
        :spaceBetween="8"
        :mousewheel="false"
        :modules="swiperModules"
        @swiper="onSwiperInit"
        @slideChange="onSlideChange"
        class="odds-swiper"
      >
        <swiper-slide v-for="(match, index) in matches" :key="index">
          <div class="match-odds">
            <div class="match-info">
              <div class="match-date">{{ match.date }}</div>
              <div class="teams">
                <div class="team">{{ match.homeTeam }}</div>
                <div class="team">{{ match.awayTeam }}</div>
              </div>
            </div>
            <div class="odds-container">
              <div
                class="odds-box"
                v-for="(odd, oddIndex) in match.odds"
                :key="oddIndex"
              >
                <span class="odds-value">{{ odd }}</span>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
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
  name: "MatchOddsSlider",
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    matches: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentSlide: 0,
      slidesCount: 0,
      swiper: null,
      swiperModules: [Navigation, Mousewheel, Keyboard],
      slidesPerView: 4,
      breakpoints: {
        1296: {
          slidesPerView: 4,
          spaceBetween: 8,
        },
        976: {
          slidesPerView: 2.4,
          spaceBetween: 8,
        },
        726: {
          slidesPerView: 1.4,
          spaceBetween: 8,
        },
        0: {
          slidesPerView: 1.1,
          spaceBetween: 8,
        },
      },
    };
  },
  computed: {
    canScrollLeft() {
      return this.currentSlide > 0;
    },
    canScrollRight() {
      return this.currentSlide < this.slidesCount - this.visibleSlides;
    },
    visibleSlides() {
      if (typeof window === "undefined") return 4;
      if (window.innerWidth >= 1296) return 4;
      if (window.innerWidth >= 976) return 3.4;
      if (window.innerWidth >= 726) return 2.4;
      return 1.2;
    },
  },
  mounted() {
    this.slidesCount = this.matches.length;
    window.addEventListener("resize", this.updateVisibility);
    this.updateSlidesPerView();
    this.$nextTick(() => {
      this.updateVisibility();
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateVisibility);
  },
  methods: {
    updateVisibility() {
      this.slidesCount = this.matches.length;
      this.updateSlidesPerView();
      this.$forceUpdate();
    },
    updateSlidesPerView() {
      if (typeof window === "undefined") {
        this.slidesPerView = 4;
      } else if (window.innerWidth >= 1296) {
        this.slidesPerView = 4;
      } else if (window.innerWidth >= 976) {
        this.slidesPerView = 3.4;
      } else if (window.innerWidth >= 726) {
        this.slidesPerView = 2.4;
      } else {
        this.slidesPerView = 1.2;
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
  },
};
</script>

<style scoped>
.match-odds-slider {
  width: 100%;
  background: var(--vertical-dark-gradient);
  padding: 16px 0;
}

.slider-container {
  position: relative;
  margin: 0 16px;
}

.odds-swiper {
  width: 100%;
  overflow: hidden;
}

.match-odds {
  display: flex;
  background: linear-gradient(
      180.02deg,
      rgba(0, 0, 0, 0.54) 20.01%,
      rgba(0, 0, 0, 0.6) 73.07%
    ),
    url("../assets/images/odds-background.jpg");
  background-size: cover;
  background-position: center;
  border: 1px solid var(--bg-50);
  border-radius: 4px;
  gap: 16px;
}

.match-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0px;
  gap: 4px;
  width: 170px;
  min-height: 100%;
  padding-left: 6px;
}

.match-date {
  font-family: var(--sport-category-tags);
  font-weight: 400;
  font-size: 11px;
  line-height: 16px;
  color: var(--text-white);
  opacity: 0.9;
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-white);
}

.odds-container {
  display: flex;
  align-items: center;
  margin: auto;
  background: rgba(22, 35, 42, 0.8);
  backdrop-filter: blur(1px);
  border-radius: 4px;
  flex: 1;
  height: calc(100% - 16px);
  margin: 8px;
}

.odds-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  height: 74px;
  padding: 8px;
  flex: 1;
}

.odds-value {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 16px;
  line-height: 10px;
  text-align: center;
  color: var(--text-white);
}

.slider-fade-left,
.slider-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  pointer-events: none;
  z-index: 2;
  transition: var(--transition);
}

.slider-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-70), transparent);
}

.slider-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-70), transparent);
}
</style>
