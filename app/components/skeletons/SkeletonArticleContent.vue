<template>
  <div class="article-content skeleton">
    <!-- Featured image skeleton -->
    <div class="featured-image-skeleton">
      <div class="skeleton-image skeleton-container-gradient"></div>
      <div class="image-caption-skeleton">
        <div class="skeleton-caption-line skeleton-container-gradient"></div>
      </div>
    </div>

    <!-- Article text skeleton -->
    <div class="article-text-skeleton">
      <!-- First paragraph -->
      <div class="paragraph-skeleton">
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl medium"
        ></div>
      </div>

      <!-- Second paragraph -->
      <div class="paragraph-skeleton">
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl short"
        ></div>
      </div>

      <!-- Match odds skeleton -->
      <div class="match-odds-skeleton skeleton-container-gradient">
        <div class="match-info-skeleton">
          <div class="skeleton-date skeleton-container-gradient"></div>
          <div class="teams-skeleton">
            <div class="skeleton-team skeleton-container-gradient"></div>
            <div class="skeleton-team skeleton-container-gradient"></div>
          </div>
        </div>
        <div class="odds-skeleton">
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

      <!-- More paragraphs -->
      <div class="paragraph-skeleton">
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl long"
        ></div>
      </div>

      <!-- Quote block skeleton -->
      <div class="quote-block-skeleton skeleton-container-gradient">
        <div
          class="skeleton-quote-line skeleton-container-gradient skeleton-text-lg"
        ></div>
        <div
          class="skeleton-quote-line skeleton-container-gradient skeleton-text-lg medium"
        ></div>
      </div>

      <!-- Final paragraph -->
      <div class="paragraph-skeleton">
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl"
        ></div>
        <div
          class="skeleton-text-line skeleton-container-gradient skeleton-text-xl short"
        ></div>
      </div>

      <!-- Tags skeleton -->
      <div class="tags-skeleton">
        <div
          v-for="n in 6"
          :key="n"
          class="skeleton-tag skeleton-container-gradient"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonArticleContent",
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.article-content {
  margin-bottom: 32px;
}

.featured-image-skeleton {
  margin-bottom: 32px;
}

.skeleton-image {
  width: 100%;
  height: 400px;
  margin-bottom: 12px;
}

.image-caption-skeleton {
  padding-left: 16px;
}

.skeleton-caption-line {
  width: 250px;
  height: 14px;
}

.article-text-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.paragraph-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-text-line.medium {
  width: 80%;
}

.skeleton-text-line.short {
  width: 60%;
}

.skeleton-text-line.long {
  width: 95%;
}

.match-odds-skeleton {
  display: flex;
  border-radius: 8px;
  padding: 16px;
  gap: 16px;
  margin: 24px 0;
}

.match-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-date {
  width: 100px;
  height: 16px;
}

.teams-skeleton {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-team {
  width: 150px;
  height: 18px;
}

.odds-skeleton {
  display: flex;
  gap: 8px;
}

.skeleton-odd {
  width: 60px;
  height: 60px;
}

.quote-block-skeleton {
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid var(--bg-40);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tags-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.skeleton-tag {
  width: 80px;
  height: 32px;
  border-radius: 16px;
}

@media screen and (max-width: 768px) {
  .skeleton-image {
    height: 250px;
  }

  .match-odds-skeleton {
    flex-direction: column;
  }
}
</style>
