<template>
  <div class="sidebar-news-list skeleton">
    <div
      v-for="index in itemCount"
      :key="`skeleton-sidebar-${index}`"
      class="sidebar-news-item"
      :class="{ 'skeleton-container-gradient': index % 2 === 0 }"
    >
      <div class="skeleton-image skeleton-container-gradient"></div>
      <div class="sidebar-content">
        <div class="skeleton-title">
          <div
            class="skeleton-line skeleton-container-gradient skeleton-text-sm"
          ></div>
          <div
            class="skeleton-line skeleton-container-gradient skeleton-text-sm medium"
          ></div>
          <div
            class="skeleton-line skeleton-container-gradient skeleton-text-sm short"
          ></div>
        </div>
        <div class="skeleton-meta">
          <div class="skeleton-tag skeleton-container-gradient"></div>
          <div class="skeleton-date skeleton-container-gradient"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonSidebar",
  props: {
    itemCount: {
      type: Number,
      default: 7,
    },
  },
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.sidebar-news-list {
  display: flex;
  flex-direction: column;
}

.sidebar-news-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 2px;
}

.sidebar-news-item:last-child {
  margin-bottom: 0;
}

.skeleton-image {
  width: 80px;
  height: 60px;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.skeleton-tag {
  width: 50px;
  height: 16px;
}

.skeleton-date {
  width: 60px;
  height: 12px;
}

@media screen and (max-width: 768px) {
  .skeleton-image {
    width: 60px;
    height: 45px;
  }

  .sidebar-news-item {
    padding: 8px;
  }
}
</style>
