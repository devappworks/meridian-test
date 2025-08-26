<template>
  <div class="related-news-skeleton">
    <div class="related-news-list">
      <div
        v-for="index in itemCount"
        :key="`skeleton-related-${index}`"
        class="related-news-item"
        :class="{ 'skeleton-container-gradient': index % 2 === 0 }"
      >
        <div class="skeleton-number skeleton-container-gradient"></div>
        <div class="content">
          <div class="skeleton-category skeleton-container-gradient"></div>
          <div class="skeleton-title">
            <div
              class="skeleton-title-line skeleton-container-gradient skeleton-text-base"
            ></div>
            <div
              class="skeleton-title-line skeleton-container-gradient skeleton-text-base medium"
            ></div>
          </div>
          <div class="timestamp">
            <div class="skeleton-timestamp skeleton-container-gradient"></div>
            <div class="divider"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonRelatedNews",
  props: {
    itemCount: {
      type: Number,
      default: 3,
    },
  },
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.related-news-skeleton {
  margin-bottom: 32px;
}

.sidebar-header {
  margin-bottom: 20px;
}

.sidebar-header h3 {
  color: var(--text-white);
  font-size: 18px;
  text-transform: uppercase;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid var(--green-primary);
}

.related-news-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.related-news-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
}

.skeleton-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-category {
  width: 60px;
  height: 16px;
}

.skeleton-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-title-line.medium {
  width: 75%;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.skeleton-timestamp {
  width: 80px;
  height: 12px;
}

.divider {
  flex-grow: 1;
  height: 0;
  border-top: 1px solid var(--bg-40);
}

@media screen and (max-width: 768px) {
  .related-news-item {
    gap: 12px;
    padding: 8px;
  }

  .skeleton-number {
    width: 20px;
    height: 20px;
  }

  .skeleton-timestamp {
    width: 70px;
  }
}
</style>
