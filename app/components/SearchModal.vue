<template>
  <div class="search-modal" v-if="isOpen">
    <div class="search-header">
      <div class="title">PRETRAGA</div>
      <div class="close-button" @click="closeSearch">
        <div class="line line1"></div>
        <div class="line line2"></div>
      </div>
    </div>

    <div class="search-content">
      <div class="search-input-container">
        <div class="search-input-wrapper">
          <div class="search-icon" @click="fetchFromApi">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                stroke="#757575"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15.75 15.75L12.4875 12.4875"
                stroke="#757575"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search news, leagues..."
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="fetchFromApi"
            autofocus
          />
        </div>
        <div
          class="search-info"
          v-if="!loading && newsResults.length === 0 && searchQuery === ''"
        >
          <p>
            Pronađite šta vas zanima na MeridianSport-u unoseći termin u polje
            za pretragu iznad.
          </p>
          <p>Rezultati pretraživanja će se pojaviti u toku unosa pojmova.</p>
        </div>
        <div v-else-if="!loading && newsResults.length > 0">
          <p class="results-info">
            Prikaz rezultata
            <span
              >{{ newsResults.indexOf(newsResults[0]) + 1 }}-{{
                newsResults.indexOf(newsResults[newsResults.length - 1]) + 1
              }}</span
            >
            za termin: "{{ searchQuery }}"
          </p>
        </div>
        <SkeletonNewsGrid v-if="loading" :cardCount="12" />
        <NewsGrid
          v-else-if="newsResults.length > 0"
          :news="newsResults"
          :emitClicks="true"
          :forceShowSportTag="true"
          @article-clicked="handleArticleClick"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { fetchFromApi } from "@/services/api";
import NewsGrid from "./NewsGrid.vue";
import SkeletonNewsGrid from "./skeletons/SkeletonNewsGrid.vue";

export default {
  name: "SearchModal",
  components: {
    NewsGrid,
    SkeletonNewsGrid,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      default: "",
    },
  },
  data() {
    return {
      searchQuery: "",
      newsResults: [],
      loading: false,
      debounceTimer: null,
    };
  },
  methods: {
    closeSearch() {
      this.$emit("close-search");
    },
    async fetchFromApi() {
      if (!this.searchQuery.trim()) {
        this.newsResults = [];
        return;
      }

      this.loading = true;
      try {
        const response = await fetchFromApi("/search", {
          searchText: this.searchQuery,
          searchLimit: 12,
          page: 1,
        });
        this.newsResults = response.result.articles;
        console.log(this.newsResults, "newsResults");

        if (this.newsResults.length > 0) {
          this.newsResults = this.newsResults.map((article) => {
            const sportFromCategories = this.getSportFromCategories(
              article.categories || []
            );
            const sport =
              sportFromCategories || article.sport || "OSTALE VESTI";
            const image =
              (article.feat_images && article.feat_images["medium"]
                ? article.feat_images["medium"].url
                : null) ||
              (article.images && article.images["medium"]
                ? article.images["medium"].url
                : null) ||
              (article.feat_images && article.feat_images["large"]
                ? article.feat_images["large"].url
                : null) ||
              (article.images && article.images["large"]
                ? article.images["large"].url
                : null) ||
              null;

              console.log(article, "ARTICLE");

              console.log(article.categories[0].slug, "CATEGORY");
              console.log(article.slug, "SLUG");

            return {
              id: article.id,
              title: article.title,
              sport,
              date: article.date,
              url: article.url,
              image,
              category: article.categories[0].slug,
              slug: article.slug,
            };
          });
        }
      } catch (error) {
        console.error("Search error:", error);
        this.newsResults = [];
      } finally {
        this.loading = false;
      }
    },
    getSportFromCategories(categories) {
      const sportMap = {
        Fudbal: "FUDBAL",
        Košarka: "KOŠARKA",
        Tenis: "TENIS",
        Odbojka: "ODBOJKA",
      };

      console.log(categories);
      if (!Array.isArray(categories)) return null;
      const sportCategory = categories.find((cat) => sportMap[cat.name]);
      return sportCategory ? sportMap[sportCategory.name] : null;
    },
    handleArticleClick(articleId) {
      this.closeSearch();
      const found = this.newsResults.find((a) => a.id === articleId);
      console.log(found, "FOUND ARTICLE");
      const target = `/${found.category}/${found.slug}`
      console.log(target, "target");
      this.$router.push(target)
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        this.searchQuery = "";
        this.newsResults = [];
        this.loading = false;
      }
    },
    searchQuery(newValue) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      if (!newValue.trim()) {
        this.newsResults = [];
        this.loading = false;
        return;
      }

      if (newValue.trim().length < 2) {
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.fetchFromApi();
      }, 300);
    },
  },
  beforeUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  },
};
</script>

<style scoped>
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background: var(--bg-90);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: auto;
}

.search-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 24px;
  width: 100%;
  height: 60px;
  background: var(--red-gradient), var(--text-white);
}

.title {
  font-family: var(--sport-category-tags);
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;
  text-align: center;
  color: var(--text-white);
  flex-grow: 1;
}

.close-button {
  width: 25px;
  height: 25px;
  position: relative;
  cursor: pointer;
}

.line {
  position: absolute;
  width: 25.46px;
  height: 0px;
  border: 1.92857px solid var(--text-white);
  top: 50%;
  left: 50%;
}

.line1 {
  transform: translate(-50%, -50%) rotate(45deg);
}

.line2 {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.search-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 44px;
  width: 100%;
  padding-top: 44px;
  overflow-y: auto;
}

.search-input-container {
  width: 100%;
  max-width: 1048px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 20px;
}

.search-input-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 0px 0px 16px;
  width: 100%;
  max-width: 1048px;
  height: 60px;
  background: var(--text-white);
  border: 2px solid #cacaca;
  border-radius: 8px;
}

.search-icon {
  margin-right: 8px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
}

.search-icon:hover {
  transform: var(--hover);
}

.search-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  color: #757575;
  background-color: transparent;
}

.search-info {
  margin-top: 24px;
}

.search-info p {
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-25);
}

.close-button:hover {
  opacity: var(--hover);
  transition: var(--transition);
}

.results-info {
  font-weight: 500;
  font-size: 14px;
  line-height: 100%;
  color: var(--text-25);
  margin-top: 24px;
}

.results-info span {
  color: var(--yellow-primary);
}

.news-grid {
  background: transparent;
  margin-left: 0;
  padding-left: 0;
  padding-right: 0;
}
</style>
