<template>
  <div class="news-grid skeleton">
    <div class="section-header" v-if="title">
      <div class="section-title" :class="sportClass">
        <h2>{{ title }}</h2>
      </div>
      <a href="#" class="view-all">Sve vesti</a>
    </div>
    <div class="grid-container" :style="gridStyle">
      <div
        v-for="index in cardCount"
        :key="`skeleton-${index}`"
        class="news-item"
      >
        <skeleton-news-card />
      </div>
    </div>
  </div>
</template>

<script>
import SkeletonNewsCard from "./SkeletonNewsCard.vue";

export default {
  name: "SkeletonNewsGrid",
  components: {
    SkeletonNewsCard,
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
    sport: {
      type: String,
      default: "NAJNOVIJE",
    },
    cardCount: {
      type: Number,
      default: 8,
    },
  },
  computed: {
    responsiveColumns() {
      if (this.windowWidth <= 425) return 1;
      if (this.windowWidth <= 768) return 2;
      if (this.windowWidth <= 1200) return 4;
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
  },
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.news-grid {
  padding: 24px 20px;
  border-radius: 8px;
  margin-left: -20px;
  background: var(--bg-90);
}

.news-grid:last-child {
  background: var(--vertical-dark-gradient);
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

.grid-container {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 1fr);
}

.news-item {
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .news-grid {
    padding: 16px;
    margin-left: -16px;
  }
}

@media screen and (max-width: 425px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
