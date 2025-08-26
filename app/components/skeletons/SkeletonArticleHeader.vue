<template>
  <div class="article-header skeleton">
    <!-- Article title skeleton -->
    <div class="skeleton-title">
      <div
        class="skeleton-line skeleton-container-gradient skeleton-text-4xl"
      ></div>
      <div
        class="skeleton-line skeleton-container-gradient skeleton-text-4xl medium"
      ></div>
      <div
        class="skeleton-line skeleton-container-gradient skeleton-text-4xl short"
      ></div>
    </div>

    <!-- Article subtitle skeleton -->
    <div class="skeleton-subtitle">
      <div
        class="skeleton-line skeleton-container-gradient skeleton-text-xl"
      ></div>
    </div>

    <!-- Article meta skeleton -->
    <div class="article-meta">
      <div class="author-date">
        <div class="skeleton-meta-line skeleton-container-gradient"></div>
      </div>
      <div class="comments-count">
        <div class="skeleton-icon skeleton-container-gradient"></div>
        <div class="skeleton-count skeleton-container-gradient"></div>
      </div>
      <div class="share-buttons">
        <div
          v-for="n in 5"
          :key="n"
          class="skeleton-share-btn skeleton-container-gradient"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonArticleHeader",
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.article-header {
  margin-bottom: 32px;
}

.skeleton-title {
  margin-bottom: 16px;
}

.skeleton-subtitle {
  margin-bottom: 24px;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.author-date {
  flex: 1;
  min-width: 200px;
}

.skeleton-meta-line {
  height: 16px;
  width: 180px;
}

.comments-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-icon {
  width: 16px;
  height: 16px;
}

.skeleton-count {
  width: 20px;
  height: 16px;
}

.share-buttons {
  display: flex;
  gap: 8px;
}

.skeleton-share-btn {
  width: 32px;
  height: 32px;
}

@media screen and (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .author-date {
    min-width: auto;
  }
}
</style>
