<template>
  <NuxtLink :to="articleUrl" class="news-card" @click="handleClick">
    <div class="news-image">
      <NuxtPicture
        :src="imageSrc"
        :alt="title"
        :img-attrs="{
          loading: 'lazy',
          decoding: 'async',
          class: 'news-card-image'
        }"
        sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 242px"
        format="webp"
        quality="85"
      />
      <div class="category-tag" v-if="showSportTag">
        <span :class="['sport-tag', sportClass]">{{ sport }}</span>
      </div>
    </div>
    <div class="news-content">
      <h3 class="news-title">{{ title }}</h3>
    </div>
  </NuxtLink>
</template>

<script>
import { getCanonicalCategoryFromSlug } from '~/utils/canonicalCategory';

export default {
  name: "NewsCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: [String, Object],
      required: true,
    },
    featImages: {
      type: Object,
      default: null,
    },
    sport: {
      type: String,
      required: true,
    },
    sectionType: {
      type: String,
      default: "",
    },
    id: {
      type: [String, Number],
      required: true,
    },
    url: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    emitEvents: {
      type: Boolean,
      default: true,
    },
    forceShowSportTag: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    articleUrl() {
      // Use canonical category for navigation
      const canonicalCategory = getCanonicalCategoryFromSlug(this.category);
      return `/${canonicalCategory}/${this.slug}/`;
    },
    imageSrc() {
      // Priority: Get WebP URL from featImages if available, otherwise fallback to regular URL
      if (this.featImages && typeof this.featImages === 'object') {
        // Try WebP first (smaller file size)
        return this.featImages.medium?.webp ||
               this.featImages.small?.webp ||
               this.featImages.medium?.url ||
               this.featImages.small?.url ||
               this.featImages.large?.url ||
               this.featImages['thumb-small']?.url ||
               '';
      }

      // Fallback to legacy string image
      if (typeof this.image === 'string') {
        return this.image;
      }

      // If image is an object, try to extract URL
      if (typeof this.image === 'object' && this.image !== null) {
        return this.image.medium?.webp ||
               this.image.small?.webp ||
               this.image.medium?.url ||
               this.image.small?.url ||
               this.image.url ||
               '';
      }

      // Final fallback
      return '';
    },
    sportClass() {
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
      return sportMap[this.sport] || "other";
    },
    showSportTag() {
      return this.forceShowSportTag || this.sport !== this.sectionType;
    },
  },
  methods: {
    handleClick() {
      console.log("🔵 NewsCard clicked!", {
        id: this.id,
        title: this.title,
        originalCategory: this.category,
        canonicalCategory: getCanonicalCategoryFromSlug(this.category),
        slug: this.slug,
        target: this.articleUrl
      });

      if (this.id && this.emitEvents) {
        console.log("🔵 NewsCard emitting event to parent");
        this.$emit("article-clicked", this.id);
      }
    },
  },
};
</script>

<style scoped>
.news-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none !important;
  color: inherit;
}

.news-card:hover {
  transform: translateY(var(--translate-y-hover));
  opacity: 1;
}

.news-image {
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
}

.news-image :deep(picture),
.news-image :deep(img) {
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

.news-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.news-title {
  font-family: var(--title);
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  color: var(--text-white);
  letter-spacing: 0.4px;
}

@media (max-width: 576px) {
  .news-card {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    width: 100%;
    height: 100%;
  }

  .news-title {
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
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

:deep(.sport-tag.football) {
  color: var(--green-primary);
}

:deep(.sport-tag.basketball) {
  color: var(--orange-primary);
}

:deep(.sport-tag.tennis) {
  color: var(--blue-primary);
}

:deep(.sport-tag.volleyball) {
  color: var(--red-primary);
}

:deep(.sport-tag.handball) {
  color: var(--cyan-primary, #00bcd4);
}

:deep(.sport-tag.athletics) {
  color: var(--amber-primary, #ffc107);
}

:deep(.sport-tag.swimming) {
  color: var(--light-blue-primary, #03a9f4);
}

:deep(.sport-tag.gymnastics) {
  color: var(--pink-primary, #e91e63);
}

:deep(.sport-tag.fighting) {
  color: var(--red-primary);
}

:deep(.sport-tag.automotive) {
  color: var(--grey-primary, #607d8b);
}

:deep(.sport-tag.cycling) {
  color: var(--lime-primary, #8bc34a);
}

:deep(.sport-tag.winter) {
  color: var(--light-grey-primary, #9e9e9e);
}

:deep(.sport-tag.esports) {
  color: var(--deep-purple-primary, #673ab7);
}

:deep(.sport-tag.interview) {
  color: var(--yellow-primary);
}

:deep(.sport-tag.focus) {
  color: var(--yellow-primary);
}

:deep(.sport-tag.geography) {
  color: var(--teal-primary, #009688);
}

:deep(.sport-tag.other) {
  color: var(--yellow-primary);
}
</style>
