<template>
  <div class="featured-section" v-if="article">
    <div class="container">
      <NuxtLink :to="articleUrl" class="featured-content">
        <div class="featured-image">
          <NuxtPicture
            :src="imageSrc"
            :alt="article.title"
            :img-attrs="{
              fetchpriority: 'high',
              decoding: 'async',
              class: 'featured-image-img'
            }"
            sizes="(max-width: 1024px) 100vw, 604px"
            format="webp"
            quality="85"
          />
          <div class="category-tag" v-if="showTag">
            <span class="sport-tag" :class="sportClass(article.sport)">{{
              article.sport
            }}</span>
          </div>
        </div>
        <div class="featured-text">
          <h2 class="featured-title">{{ article.title }}</h2>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  name: "FeaturedArticle",
  props: {
    article: {
      type: Object,
      default: null,
      validator: function (obj) {
        return (
          obj === null || ("title" in obj && "sport" in obj && ("image" in obj || "featImages" in obj))
        );
      },
    },
    showTag: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    articleUrl() {
      if (!this.article) return '/';
      return `/${this.article.category}/${this.article.slug}/`;
    },
    imageSrc() {
      if (!this.article) return '';

      // Priority: Use WebP URLs from featImages for featured images (smaller file size)
      if (this.article.featImages && typeof this.article.featImages === 'object') {
        return this.article.featImages['extra-large']?.webp ||
               this.article.featImages.large?.webp ||
               this.article.featImages['extra-large']?.url ||
               this.article.featImages.large?.url ||
               this.article.featImages.medium?.url ||
               this.article.featImages.small?.url ||
               '';
      }

      // Fallback to legacy string image
      if (typeof this.article.image === 'string') {
        return this.article.image;
      }

      // If image is an object, try to extract URL
      if (typeof this.article.image === 'object' && this.article.image !== null) {
        return this.article.image['extra-large']?.webp ||
               this.article.image.large?.webp ||
               this.article.image['extra-large']?.url ||
               this.article.image.large?.url ||
               this.article.image.medium?.url ||
               this.article.image.url ||
               '';
      }

      // Final fallback
      return '';
    },
  },
  methods: {
    sportClass(sport) {
      const sportMap = {
        // Main sports
        FUDBAL: "football",
        "DOMAĆI FUDBAL": "football",
        REPREZENTACIJE: "football",
        "EVROPSKA TAKMIČENJA": "football",
        KOŠARKA: "basketball",
        EVROBASKET: "basketball",
        TENIS: "tennis",
        ODBOJKA: "volleyball",

        // Extended sports
        RUKOMET: "handball",
        ATLETIKA: "athletics",
        PLIVANJE: "swimming",
        GIMNASTIKA: "gymnastics",
        "BORILAČKE VEŠTINE": "fighting",
        AUTOMOTO: "automotive",
        BICIKLIZAM: "cycling",
        "ZIMSKI SPORTOVI": "winter",
        ESPORTS: "esports",
        INTERVJUI: "interview",
        "SPORT FOKUS": "focus",
        "SPORTSKA GEOGRAFIJA": "geography",
        "OSTALI SPORTOVI": "other",
        "OSTALE VESTI": "other",
      };
      return sportMap[sport] || "other";
    },
  },
};
</script>

<style scoped>

.featured-section .container {
  max-width: 1440px;
}

.featured-content {
  container-type: inline-size;
  container-name: featured-content;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 20px 10px 10px;
  background: var(--dark-gradient);
  border-radius: 8px;
  position: relative;
  flex-direction: row;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: -16px;
  flex-wrap: wrap;
  text-decoration: none;
  color: inherit;
}

.featured-content:hover {
  transform: translateY(var(--translate-y-hover));
  opacity: 1;
}

.featured-image {
  position: relative;
  width: 604px;
  height: 100%;
  min-height: 340px;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.featured-image :deep(picture),
.featured-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.category-tag {
  position: absolute;
  left: 4px;
  bottom: 4px;
}

/* Sport Category Tags - Matching Site Style */
:deep(.sport-tag) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-family: var(--sport-category-tags);
  font-weight: 400;
  font-size: 12px;
  line-height: 11px;
  text-transform: uppercase;
  border-radius: 4px;
  background: rgba(17, 17, 17, 0.8);
}

.featured-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.featured-title {
  font-family: var(--title);
  font-weight: 700;
  font-size: 36px;
  line-height: 48px;
  color: var(--text-white);
  min-width: 204px;
}

@media screen and (max-width: 1024px) {
  .featured-content {
    flex-direction: column;
    padding: 10px;
  }

  .featured-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: auto;
    aspect-ratio: 345 / 194;
  }

  .featured-text {
    width: 100%;
    padding: 16px 0;
  }

  .featured-title {
    font-size: 28px;
    line-height: 36px;
  }
}

@media screen and (max-width: 576px) {
  .featured-content {
    gap: 10px;
  }

  .featured-text {
    padding: 12px 0;
  }
}

@container featured-content (max-width: 862px) {
  .featured-image {
    width: 100%;
  }
}
</style>
