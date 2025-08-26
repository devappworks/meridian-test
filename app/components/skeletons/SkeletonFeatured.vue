<template>
  <div class="featured-section skeleton">
    <div class="container">
      <div class="featured-content">
        <div class="featured-image">
          <div class="skeleton-img skeleton-container-gradient"></div>
          <div class="category-tag">
            <span
              class="sport-tag skeleton-tag skeleton-container-gradient"
            ></span>
          </div>
        </div>
        <div class="featured-text">
          <div class="skeleton-title">
            <div
              class="skeleton-line skeleton-container-gradient skeleton-text-5xl"
            ></div>
            <div
              class="skeleton-line skeleton-container-gradient skeleton-text-5xl short"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonFeatured",
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.featured-section {
  padding-top: 16px;
}

.featured-section .container {
  max-width: 1440px;
}

.featured-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 20px 10px 10px;
  background: var(--dark-gradient);
  border-radius: 8px;
  position: relative;
  flex-direction: row;
}

.featured-image {
  position: relative;
  width: 604px;
  height: 339.04px;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.category-tag {
  position: absolute;
  left: 4px;
  bottom: 4px;
}

.skeleton-tag {
  display: inline-block;
  width: 80px;
  height: 24px;
}

.featured-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.skeleton-title {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media screen and (max-width: 1024px) {
  .featured-content {
    flex-direction: column;
    padding: 10px;
  }

  .featured-image {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }

  .featured-text {
    width: 100%;
    padding: 16px 0;
  }
}
</style>
