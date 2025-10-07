<template>
  <div class="featured-section" v-if="article">
    <div class="container">
      <div class="featured-content" @click.stop="navigateToArticle">
        <div class="featured-image">
          <img
            :src="responsiveImage.src"
            :srcset="responsiveImage.srcset"
            :sizes="responsiveImage.sizes"
            :alt="article.title"
            fetchpriority="high"
            decoding="async"
            width="1200"
            height="675"
          />
          <div class="category-tag">
            <span class="sport-tag" :class="sportClass(article.sport)">{{
              article.sport
            }}</span>
          </div>
        </div>
        <div class="featured-text">
          <h2 class="featured-title">{{ article.title }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateFeaturedImageAttrs } from '~/utils/responsiveImage';

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
  },
  computed: {
    responsiveImage() {
      if (!this.article) {
        return { src: '', srcset: '', sizes: '' };
      }

      // If featImages object is provided, use it for responsive images
      if (this.article.featImages && typeof this.article.featImages === 'object') {
        return generateFeaturedImageAttrs(this.article.featImages);
      }

      // Fallback to legacy string image
      if (typeof this.article.image === 'string') {
        return {
          src: this.article.image,
          srcset: '',
          sizes: ''
        };
      }

      // If image is an object (feat_images), use it
      if (typeof this.article.image === 'object' && this.article.image !== null) {
        return generateFeaturedImageAttrs(this.article.image);
      }

      // Final fallback
      return {
        src: '',
        srcset: '',
        sizes: ''
      };
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
    resolveArticleRoute(rawUrl, fallbackId) {
      // Normalize incoming URLs to internal app routes
      if (!rawUrl || rawUrl === '#') {
        return fallbackId ? `/article/${fallbackId}` : '/';
      }
      try {
        const u = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const p = u.pathname || '/';
        // Collapse /article/:id/:slug to /article/:id for local route support
        const match = p.match(/^\/article\/(\d+)(?:\/.+)?$/i);
        if (match) return `/article/${match[1]}`;
        return p.startsWith('/') ? p : `/${p}`;
      } catch {
        const p = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        const match = p.match(/^\/article\/(\d+)(?:\/.+)?$/i);
        if (match) return `/article/${match[1]}`;
        return p;
      }
    },
    navigateToArticle() {
      if (this.article && this.article.id) {
        /* const target = this.article.url
          ? this.resolveArticleRoute(this.article.url, this.article.id)
          : `/article/${this.article.id}` */
        const target = `/${this.article.category}/${this.article.slug}/`
        this.$router.push(target);
      }
    },
  },
};
</script>

<style scoped>

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
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: -16px;
  flex-wrap: wrap;
}

.featured-content:hover {
  transform: translateY(var(--translate-y-hover));
}

.featured-image {
  position: relative;
  width: 604px;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    height: auto;
    aspect-ratio: 16/9;
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
</style>
