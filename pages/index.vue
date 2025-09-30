<script setup>
useHead({ title: "Home" });
</script>

<template>
  <div class="content-wrapper">
    <!-- Match odds section with Loading State -->
    <!-- <SkeletonMatchOdds v-if="loading.matches" />
    <MatchOddsSlider v-else :matches="matches" /> -->
    <!-- End of match odds section -->
    <div class="main-column">
      <!-- Featured Article with Loading State -->
      <SkeletonFeatured v-if="loading.featured" />
      <FeaturedArticle v-else :article="featuredArticle" />

      <!-- Latest News Grid with Loading State -->
      <SkeletonNewsGrid v-if="loading.latestGrid" columns="4" />
      <NewsGrid v-else :news="latestNewsGrid" columns="4" />

      <LiveStream />

      <!-- Football News with Loading State -->
      <SkeletonNewsGrid v-if="loading.football" title="FUDBAL" sport="FUDBAL" />
      <NewsGrid v-else title="FUDBAL" sport="FUDBAL" :news="footballNews" />

      <!-- Basketball News with Loading State -->
      <SkeletonNewsSlider
        v-if="loading.basketball"
        title="KOŠARKA"
        sport="KOŠARKA"
      />
      <NewsSlider
        v-else
        title="KOŠARKA"
        sport="KOŠARKA"
        :news="basketballNews"
      />

      <!-- Tennis News with Loading State -->
      <SkeletonNewsSlider v-if="loading.tennis" title="TENIS" sport="TENIS" />
      <NewsSlider v-else title="TENIS" sport="TENIS" :news="tennisNews" />

      <YouTubeSection />

      <!-- Other News with Loading State -->
      <SkeletonNewsGrid
        v-if="loading.other"
        title="OSTALE VESTI"
        sport="OSTALE VESTI"
      />
      <NewsGrid
        v-else
        title="OSTALE VESTI"
        sport="OSTALE VESTI"
        :news="otherNews"
        background="true"
      />
    </div>

    <div class="sidebar-column">
      <div class="sidebar-news">
        <div class="sidebar-header">
          <h3>NAJNOVIJE VESTI</h3>
          <NuxtLink to="/najnovije-vesti" class="see-all">Sve vesti</NuxtLink>
        </div>
        <!-- Sidebar News with Loading State -->
        <SkeletonSidebar v-if="loading.sidebar" />
        <NewsSidebar v-else :latestNews="latestNews" />
      </div>

      <NewsletterForm />

      <div class="tipovi-dana">
        <div>
          <h3 class="tipovi-title">TIPOVI DANA</h3>
          <div class="tipovi-content">
            <div
              v-for="(item, index) in tipovi"
              :key="`tip-${index}`"
              class="tip-item"
            >
              <div class="tip-category" :class="sportClass(item.sport)">
                <span>{{ item.sport }}</span>
              </div>
              <div class="tip-headline">
                <p>{{ item.title }}</p>
              </div>
              <div class="tip-time">
                <span>{{ item.time }}</span>
                <div class="divider"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdBanners />
    </div>
  </div>
</template>

<script>
import FeaturedArticle from "@old/components/Featured.vue";
import NewsGrid from "@old/components/NewsGrid.vue";
import NewsSlider from "@old/components/NewsSlider.vue";
import NewsSidebar from "@old/components/Sidebar.vue";
import LiveStream from "@old/components/LiveStream.vue";
import YouTubeSection from "@old/components/YouTube.vue";
import NewsletterForm from "@old/components/Newsletter.vue";
import AdBanners from "@old/components/AdBanners.vue";
/* import MatchOddsSlider from '@old/components/MatchOddsSlider.vue' */
import { fetchFromApi } from "@old/services/api";

// Import skeleton components
import SkeletonFeatured from "@old/components/skeletons/SkeletonFeatured.vue";
import SkeletonNewsGrid from "@old/components/skeletons/SkeletonNewsGrid.vue";
import SkeletonNewsSlider from "@old/components/skeletons/SkeletonNewsSlider.vue";
import SkeletonSidebar from "@old/components/skeletons/SkeletonSidebar.vue";
/* import SkeletonMatchOdds from '@old/components/skeletons/SkeletonMatchOdds.vue' */

export default {
  name: "HomePage",
  components: {
    FeaturedArticle,
    NewsGrid,
    NewsSlider,
    NewsSidebar,
    LiveStream,
    YouTubeSection,
    NewsletterForm,
    AdBanners,
    /* MatchOddsSlider, */
    SkeletonFeatured,
    SkeletonNewsGrid,
    SkeletonNewsSlider,
    SkeletonSidebar,
    /* SkeletonMatchOdds */
  },
  methods: {
    async fetchArticles() {
      // Set all loading states to true
      this.loading = {
        matches: true,
        featured: true,
        latestGrid: true,
        football: true,
        basketball: true,
        tennis: true,
        other: true,
        sidebar: true,
      };

      // Add a small delay for the matches (since they're static data)
      setTimeout(() => {
        this.loading.matches = false;
      }, 500);

      try {
        const featuredData = await fetchFromApi("/getHomepageFeaturedArticles");
        const featuredArticles = featuredData.result.articles;

        if (featuredArticles.length > 0) {
          this.featuredArticle = {
            id: featuredArticles[0].id,
            title: featuredArticles[0].title,
            sport: this.getSportFromCategories(featuredArticles[0].categories),
            date: featuredArticles[0].date,
            url: featuredArticles[0].url,
            image: featuredArticles[0].feat_images["large"]
              ? featuredArticles[0].feat_images["large"].url
              : null,
            content: featuredArticles[0].contents,
          };
          this.loading.featured = false;

          this.latestNewsGrid = featuredArticles
            .slice(1, 9)
            .map(this.mapArticleData);
          this.loading.latestGrid = false;
        }

        const data = await fetchFromApi("/getArticles");
        const articles = data.result.articles;

        if (articles.length > 0) {
          this.latestNews = articles.slice(0, 8).map((article) => ({
            id: article.id,
            title: article.title,
            sport: this.getSportFromCategories(article.categories),
            date: article.date,
            url: article.url,
            image: article.feat_images["thumb"]
              ? article.feat_images["thumb"].url
              : null,
          }));
          this.loading.sidebar = false;

          this.otherNews = articles.slice(8, 16).map(this.mapArticleData);
          this.loading.other = false;
        }

        // Fetch sport-specific articles in parallel
        const [tennisArticles, basketballArticles, footballArticles] =
          await Promise.all([
            fetchFromApi("/getArticles", {
              articleLimit: 50,
              "category[]": 41,
            }),
            fetchFromApi("/getArticles", {
              articleLimit: 50,
              "category[]": 25,
            }),
            fetchFromApi("/getArticles", {
              articleLimit: 50,
              "category[]": 28,
            }),
          ]);

        // Process sport-specific sections
        this.footballNews = footballArticles.result.articles
          .slice(0, 8)
          .map((article) => ({
            id: article.id,
            title: article.title,
            sport: "FUDBAL",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));
        this.loading.football = false;

        this.basketballNews = basketballArticles.result.articles
          .slice(0, 12)
          .map((article) => ({
            id: article.id,
            title: article.title,
            sport: "KOŠARKA",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));
        this.loading.basketball = false;

        this.tennisNews = tennisArticles.result.articles
          .slice(0, 12)
          .map((article) => ({
            id: article.id,
            title: article.title,
            sport: "TENIS",
            date: article.date,
            url: article.url,
            image: article.feat_images["medium"]
              ? article.feat_images["medium"].url
              : null,
          }));
        this.loading.volleyball = false;
      } catch (error) {
        console.error("Error fetching articles:", error);
        this.resetAllNews();
        // Turn off all loading states on error
        this.loading = {
          matches: false,
          featured: false,
          latestGrid: false,
          football: false,
          basketball: false,
          tennis: false,
          other: false,
          sidebar: false,
        };
      }
    },

    mapArticleData(article) {
      return {
        id: article.id,
        title: article.title,
        sport: this.getSportFromCategories(article.categories),
        date: article.date,
        url: article.url,
        image: article.feat_images["medium"]
          ? article.feat_images["medium"].url
          : null,
      };
    },

    resetAllNews() {
      this.featuredArticle = null;
      this.latestNewsGrid = [];
      this.latestNews = [];
      this.footballNews = [];
      this.basketballNews = [];
      this.tennisNews = [];
      this.otherNews = [];
    },

    groupArticlesBySport(articles) {
      const groups = {
        FUDBAL: [],
        KOŠARKA: [],
        ODBOJKA: [],
        TENIS: [],
        "OSTALE VESTI": [],
      };

      articles.forEach((article) => {
        const sport = this.getSportFromCategories(article.categories);
        if (groups[sport]) {
          groups[sport].push(article);
        } else {
          groups["OSTALE VESTI"].push(article);
        }
      });

      return groups;
    },

    getSportFromCategories(categories) {
      // Map category names to sport types
      const sportMap = {
        Fudbal: "FUDBAL",
        Košarka: "KOŠARKA",
        Tenis: "TENIS",
        Odbojka: "ODBOJKA",
      };

      // Find the sport category
      const sportCategory = categories.find((cat) => sportMap[cat.name]);
      return sportCategory ? sportMap[sportCategory.name] : "OSTALE VESTI";
    },

    sportClass(sport) {
      const sportMap = {
        FUDBAL: "football",
        KOŠARKA: "basketball",
        TENIS: "tennis",
        ODBOJKA: "volleyball",
      };
      return sportMap[sport] || "";
    },

    startDragging(e) {
      this.isDragging = true;
      const slider = this.$refs.slider;
      this.startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
      this.scrollLeft = slider.scrollLeft;
      slider.style.cursor = "grabbing";
      slider.style.userSelect = "none";
    },

    drag(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      const slider = this.$refs.slider;
      const x = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
    },

    stopDragging() {
      this.isDragging = false;
      const slider = this.$refs.slider;
      slider.style.cursor = "grab";
      slider.style.removeProperty("user-select");

      // Snap to closest item
      const itemWidth = slider.querySelector(".match-odds").offsetWidth + 8; // 8px is the gap
      const scrollPosition = slider.scrollLeft;
      const nearestItem = Math.round(scrollPosition / itemWidth);

      slider.scrollTo({
        left: nearestItem * itemWidth,
        behavior: "smooth",
      });
    },

    slideMatchOdds(direction) {
      const slider = this.$refs.slider;
      const itemWidth = slider.querySelector(".match-odds").offsetWidth + 8; // 8px is the gap

      if (direction === "next") {
        slider.scrollBy({ left: itemWidth, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: -itemWidth, behavior: "smooth" });
      }
    },
  },
  data() {
    return {
      currentPage: "home",
      latestNews: [],
      featuredArticle: null,
      latestNewsGrid: [],
      footballNews: [],
      basketballNews: [],
      tennisNews: [],
      otherNews: [],
      tipovi: [
        {
          title:
            "NAVIJAČU GA TERAJU, ON SE OGLASIO NA INSTAGRAMU: Poruka Nemanje Nedovića!   Poruka Nemanje Nedovića!  Poruka Nemanje Ned",
          sport: "FUDBAL",
          time: "10 feb 17:34",
        },
        {
          title:
            "NAVIJAČU GA TERAJU, ON SE OGLASIO NA INSTAGRAMU: Poruka Nemanje Nedovića!   Poruka Nemanje Nedovića!  Poruka Nemanje Ned",
          sport: "KOŠARKA",
          time: "10 feb 17:34",
        },
        {
          title:
            "NAVIJAČU GA TERAJU, ON SE OGLASIO NA INSTAGRAMU: Poruka Nemanje Nedovića!   Poruka Nemanje Nedovića!  Poruka Nemanje Ned",
          sport: "TENIS",
          time: "10 feb 17:34",
        },
      ],
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      currentSlide: 0,
      matches: [
        {
          date: "03.02. 16:00",
          homeTeam: "Manchester United",
          awayTeam: "Wolverhampton Wanderers",
          odds: ["1.32", "1.32", "1.32"],
        },
        {
          date: "03.02. 16:00",
          homeTeam: "Manchester United",
          awayTeam: "Wolverhampton Wanderers",
          odds: ["1.32", "1.32", "1.32"],
        },
        {
          date: "03.02. 16:00",
          homeTeam: "Manchester United",
          awayTeam: "Wolverhampton Wanderers",
          odds: ["1.32", "1.32", "1.32"],
        },
        {
          date: "03.02. 16:00",
          homeTeam: "Manchester United",
          awayTeam: "Wolverhampton Wanderers",
          odds: ["1.32", "1.32", "1.32"],
        },
      ],
      loading: {
        matches: true,
        featured: true,
        latestGrid: true,
        football: true,
        basketball: true,
        tennis: true,
        other: true,
        sidebar: true,
      },
    };
  },
  mounted() {
    this.fetchArticles();
  },
};
</script>

<style scoped>
.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-column {
  flex: 1;
  min-width: 0; /* Prevents flex items from overflowing */
}

.sidebar-column {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
}

.sidebar-header h3 {
  color: var(--text-white);
  font-size: 18px;
  text-transform: uppercase;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid var(--text-white);
}

.see-all {
  color: var(--text-white);
  text-decoration: underline;
}

.tipovi-dana {
  margin-top: 20px;
}

.tipovi-title {
  display: flex;
  width: 100%;
  height: 44px;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  background-color: var(--yellow-primary);
  border: 1px solid var(--bg-40);
  border-radius: 8px;
  color: var(--text-100);
}

.tipovi-content {
  padding: 16px;
  background-color: var(--bg-70);
  border: 1px solid var(--bg-40);
  border-radius: 8px;
  margin-top: 12px;
}

.tip-item:not(:last-child) {
  margin-bottom: 32px;
}

.tip-category {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.tip-category.football {
  color: var(--green-primary);
}

.tip-category.basketball {
  color: var(--orange-primary);
}

.tip-category.tennis {
  color: var(--blue-primary);
}

.tip-headline p {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-white);
  margin: 8px 0;
}

.tip-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-time span {
  font-size: 15px;
  color: var(--text-25);
  font-weight: 400;
}

.divider {
  flex-grow: 1;
  height: 0;
  border-top: 1px solid var(--bg-40);
  margin: 0 8px;
}

.match-odds-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.match-odds-container {
  display: flex;
  align-items: center;
  background: var(--vertical-dark-gradient);
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  padding: 16px 32px;
  cursor: grab;
  user-select: none;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.match-odds-container:active {
  cursor: grabbing;
}

.match-odds-container::-webkit-scrollbar {
  display: none;
}

.match-odds {
  flex: 0 0 auto;
  min-width: 300px;
  max-width: 600px;
  background: linear-gradient(
      180.02deg,
      rgba(0, 0, 0, 0.54) 20.01%,
      rgba(0, 0, 0, 0.6) 73.07%
    ),
    url("../assets/images/odds-background.jpg");
  background-size: cover;
  background-position: center;
  border: 1px solid var(--bg-50);
  border-radius: 4px;
  gap: 16px;
}

.match-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0px;
  gap: 4px;
  width: 170px;
  min-height: 100%;
  padding-left: 6px;
}

.match-date {
  font-family: var(--sport-category-tags);
  font-weight: 400;
  font-size: 11px;
  line-height: 16px;
  color: var(--text-white);
  opacity: 0.9;
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-white);
}

.odds-container {
  display: flex;
  align-items: center;
  margin: auto;
  background: rgba(22, 35, 42, 0.8);
  backdrop-filter: blur(1px);
  border-radius: 4px;
  flex: 1;
  height: calc(100% - 16px);
  margin: 8px;
}

.odds-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  height: 74px;
  padding: 8px;
  flex: 1;
}

.odds-value {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 16px;
  line-height: 10px;
  text-align: center;
  color: var(--text-white);
}

.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--bg-50);
  color: var(--text-white);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  z-index: 1;
}

.slider-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.slider-nav.prev {
  left: 4px;
}

.slider-nav.next {
  right: 4px;
}

.news-grid:last-child {
  background: var(--vertical-dark-gradient);
}

@media screen and (min-width: 1296px) {
  .match-odds-container {
    justify-content: center;
    flex-wrap: wrap;
    overflow-x: visible;
    cursor: default;
  }

  .slider-nav {
    display: none;
  }
}

@media screen and (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar-column {
    width: 100%;
  }

  .sidebar-column div.newsletter {
    align-self: end;
  }
}

@media screen and (max-width: 576px) {
  .sidebar-column > * {
    width: 100%;
  }

  .ad-banners-container div.ad-section {
    flex-direction: column;
  }

  .sidebar-column div.ad-banners-container {
    width: 100%;
  }
}
</style>
