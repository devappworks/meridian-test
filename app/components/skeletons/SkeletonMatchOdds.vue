<template>
  <div class="match-odds-section skeleton">
    <div class="container">
      <div class="slider-wrapper">
        <div class="match-odds-slider">
          <div
            v-for="index in matchCount"
            :key="`skeleton-match-${index}`"
            class="match-odds-item skeleton-container-gradient"
          >
            <div class="skeleton-date skeleton-container-gradient"></div>
            <div class="teams-container">
              <div class="skeleton-team skeleton-container-gradient"></div>
              <div class="vs-text">VS</div>
              <div class="skeleton-team skeleton-container-gradient"></div>
            </div>
            <div class="odds-container">
              <div
                class="skeleton-odd skeleton-container-gradient skeleton-accent-bg"
              ></div>
              <div
                class="skeleton-odd skeleton-container-gradient skeleton-accent-bg"
              ></div>
              <div
                class="skeleton-odd skeleton-container-gradient skeleton-accent-bg"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonMatchOdds",
  props: {
    matchCount: {
      type: Number,
      default: 4,
    },
  },
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.match-odds-section {
  background: var(--dark-gradient);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.container {
  max-width: 1440px;
}

.slider-wrapper {
  position: relative;
  overflow: hidden;
}

.match-odds-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.match-odds-slider::-webkit-scrollbar {
  display: none;
}

.match-odds-item {
  flex: 0 0 auto;
  width: 280px;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-date {
  height: 16px;
  width: 100px;
}

.teams-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.skeleton-team {
  flex: 1;
  height: 18px;
}

.vs-text {
  color: var(--text-white);
  font-size: 12px;
  font-weight: 600;
  padding: 0 8px;
}

.odds-container {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.skeleton-odd {
  flex: 1;
  height: 32px;
}

@media screen and (max-width: 768px) {
  .match-odds-item {
    width: 240px;
  }

  .match-odds-slider {
    gap: 12px;
  }

  .match-odds-section {
    padding: 16px;
  }
}

@media screen and (max-width: 425px) {
  .match-odds-item {
    width: 200px;
  }
}
</style>
