<template>
  <div class="news-slider skeleton" :class="sportClass">
    <div class="section-header" v-if="title">
      <div class="section-title" :class="sportClass">
        <h2>{{ title }}</h2>
      </div>
      <a href="#" class="view-all">Sve vesti</a>
    </div>
    <div class="slider-container">
      <div class="slider-content">
        <div
          v-for="index in cardCount"
          :key="`skeleton-slider-${index}`"
          class="slider-item"
        >
          <skeleton-news-card />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SkeletonNewsCard from "./SkeletonNewsCard.vue";

export default {
  name: "SkeletonNewsSlider",
  components: {
    SkeletonNewsCard,
  },
  props: {
    title: {
      type: String,
      required: false,
      default: "",
    },
    sport: {
      type: String,
      default: "NAJNOVIJE",
    },
    cardCount: {
      type: Number,
      default: 6,
    },
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
  },
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.news-slider {
  padding: 24px 20px;
  border-radius: 8px;
  margin-left: -20px;
  background: var(--bg-90);
}

.news-slider.tennis {
  background: var(--vertical-dark-gradient);
}

.news-slider.basketball {
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
  color: var(--text-white);
  font-size: 18px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-all {
  color: var(--text-white);
  text-decoration: underline;
  font-size: 14px;
  margin-left: auto;
}

.slider-container {
  position: relative;
  overflow: hidden;
}

.slider-content {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.slider-content::-webkit-scrollbar {
  display: none;
}

.slider-item {
  flex: 0 0 auto;
  width: 280px;
}

@media screen and (max-width: 768px) {
  .news-slider {
    padding: 16px;
    margin-left: -16px;
  }

  .slider-item {
    width: 240px;
  }

  .slider-content {
    gap: 12px;
  }
}

@media screen and (max-width: 425px) {
  .slider-item {
    width: 200px;
  }
}
</style>
