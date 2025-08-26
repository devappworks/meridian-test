<template>
  <div class="news-card skeleton">
    <div class="card-content">
      <div class="image-container">
        <div class="skeleton-img skeleton-container-gradient"></div>
        <div class="overlay-content">
          <div class="skeleton-tag skeleton-container-gradient"></div>
        </div>
      </div>
      <div class="text-content">
        <div class="skeleton-title">
          <div
            class="skeleton-line skeleton-container-gradient skeleton-text-base"
          ></div>
          <div
            class="skeleton-line skeleton-container-gradient skeleton-text-base medium"
          ></div>
          <div
            class="skeleton-line skeleton-container-gradient skeleton-text-base short"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonNewsCard",
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.news-card {
  background: var(--dark-gradient);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  transition: var(--transition);
}

.card-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  height: 100%;
}

.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.8) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}

.skeleton-tag {
  width: 60px;
  height: 20px;
  margin-bottom: 8px;
}

.text-content {
  padding: 16px;
  background: var(--dark-gradient);
}

.skeleton-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media screen and (max-width: 768px) {
  .text-content {
    padding: 12px;
  }
}
</style>
