<template>
  <div class="article-page">
    <div class="content-wrapper">
      <!-- Main content column -->
      <div class="main-column article-column" ref="mainColumn">
        <!-- Loading state with skeletons -->
        <div v-if="loading.article">
          <SkeletonArticleHeader />
          <SkeletonArticleContent />

          <!-- Other news section skeleton -->
          <div class="other-news-section">
            <div class="section-header">
              <h2 class="section-title">OSTALE VESTI</h2>
            </div>
            <SkeletonNewsGrid
              sport="OSTALE VESTI"
              :columns="3"
              :cardCount="6"
            />
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>

        <!-- Article content -->
        <div v-else-if="article">
          <!-- Article header -->
          <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <p class="article-subtitle" v-if="article.subtitle">
              {{ article.subtitle }}
            </p>

            <!-- Article meta -->
            <div class="article-meta">
              <div class="author-date">
                <p>
                  <span class="author" v-if="article.author"
                    >Od {{ article.author }}</span
                  ><span v-else>Redakcija</span> -
                  {{ formatDate(article.date) }}
                </p>
              </div>
              <div class="comments-count">
                <a href="#" @click.prevent="toggleComments">
                  <img
                    src="@/assets/images/vector.svg"
                    alt="Comment Icon"
                    class="icon"
                  />
                  <span
                    v-if="loading.comments"
                    class="count skeleton-text"
                  ></span>
                  <span v-else class="count">{{ totalComments }}</span>
                </a>
              </div>
              <div class="share-buttons">
                <button
                  class="share-btn"
                  @click="share('viber')"
                  aria-label="Share on Viber"
                >
                  <img src="@/assets/images/viber.svg" alt="Share on Viber" />
                </button>
                <button
                  class="share-btn"
                  @click="share('facebook')"
                  aria-label="Share on Facebook"
                >
                  <img
                    src="@/assets/images/facebook.svg"
                    alt="Share on Facebook"
                  />
                </button>
                <button
                  class="share-btn"
                  @click="share('twitter')"
                  aria-label="Share on Twitter"
                >
                  <img
                    src="@/assets/images/twitter.svg"
                    alt="Share on Twitter"
                  />
                </button>
                <button
                  class="share-btn"
                  @click="share('whatsapp')"
                  aria-label="Share on WhatsApp"
                >
                  <img
                    src="@/assets/images/whatsapp.svg"
                    alt="Share on WhatsApp"
                  />
                </button>
                <button
                  class="share-btn"
                  @click="share('instagram')"
                  aria-label="Share on Instagram"
                >
                  <img
                    src="@/assets/images/instagram.svg"
                    alt="Share on Instagram"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Conditional rendering of article content or comments -->
          <div v-if="showComments">
            <CommentsPage
              :article-id="id"
              :comments="comments"
              :pagination="commentsPagination"
              @comment-added="handleCommentAdded"
            />
          </div>
          <div v-else>
            <!-- Featured image -->
            <div
              class="featured-image"
              v-if="article.images && article.images.large"
            >
              <img :src="article.images.large.url" :alt="article.title" />
              <div class="image-caption" v-if="article.featured_image_caption">
                <span>FOTO:</span> {{ article.featured_image_caption }}
              </div>
            </div>

            <!-- Article content -->
            <div class="article-content">
              <!-- First 4 paragraphs -->
              <div v-html="beforeFifthParagraph" class="article-text"></div>

              <!-- Match odds section -->
              <!-- <div class="match-odds">
                <div class="match-info">
                  <div class="match-date">03.02. 16:00</div>
                  <div class="teams">
                    <div class="team">Manchester United</div>
                    <div class="team">Wolverhampton Wanderers</div>
                  </div>
                </div>
                <div class="odds-container">
                  <div class="odds-box">
                    <span class="odds-label">1</span>
                    <span class="odds-value">1.32</span>
                  </div>
                  <div class="odds-box">
                    <span class="odds-label">X</span>
                    <span class="odds-value">1.32</span>
                  </div>
                  <div class="odds-box">
                    <span class="odds-label">2</span>
                    <span class="odds-value">1.32</span>
                  </div>
                </div>
              </div> -->

              <!-- JOŠ VESTI section with fifth paragraph -->
              <div class="more-news">
                <div class="more-news-content">
                  <div v-html="fifthParagraph" class="text-column"></div>
                  <div class="more-news-column">
                    <div v-if="loading.relatedNews" class="more-news-grid">
                      <div
                        v-for="n in josVestiNews.length"
                        :key="n"
                        class="news-item"
                      >
                        <div class="news-image skeleton"></div>
                        <div class="news-title skeleton-text"></div>
                      </div>
                    </div>
                    <div v-else class="more-news-grid">
                      <div
                        v-for="news in josVestiNews"
                        :key="news.id"
                        class="news-item"
                        @click="navigateToArticle(news.id)"
                      >
                        <div class="news-image">
                          <img :src="news.image" :alt="news.title" />
                        </div>
                        <h3 class="news-title">{{ news.title }}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Remaining paragraphs after fifth -->
              <div v-html="afterFifthParagraph" class="article-text"></div>

              <!-- Quote block -->
              <div class="quote-block">
                <div class="quote-content">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse eget eleifend tellus. Pellentesque habitant
                    morbi tristique senectus et netus et malesuada fames ac
                    turpis egestas. Vestibulum feugiat eros luctus lacus
                    vulputate eleifend.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse eget eleifend tellus. Pellentesque habitant
                    morbi tristique senectus et netus et malesuada fames ac.
                  </p>
                </div>
              </div>

              <!-- Tags section -->
              <div class="tags-section">
                <button
                  class="tag"
                  v-for="tag in article.tags"
                  :key="tag.id"
                  @click="navigateToTag(tag.id, tag.name)"
                >
                  {{ tag.name.toUpperCase() }}
                </button>
              </div>

              <!-- Other news section -->
              <div class="other-news-section">
                <div class="section-header">
                  <h2 class="section-title">OSTALE VESTI</h2>
                </div>
                <div v-if="loading.otherNews">
                  <SkeletonNewsGrid
                    sport="OSTALE VESTI"
                    :columns="3"
                    :cardCount="6"
                  />
                </div>
                <div v-else>
                  <NewsGrid
                    :news="otherNews"
                    sport="OSTALE VESTI"
                    :columns="3"
                    background="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar-column">
        <!-- Related news section -->
        <div class="sidebar-news">
          <SkeletonRelatedNews v-if="loading.article" />

          <!-- Actual related news -->
          <div v-else>
            <div class="sidebar-header">
              <h3 class="football">NAJNOVIJE VESTI</h3>
            </div>
            <div v-if="loading.relatedNews" class="related-news-list">
              <div v-for="n in 3" :key="n" class="related-news-item">
                <div class="number skeleton">{{ n }}</div>
                <div class="content">
                  <div class="category skeleton-text"></div>
                  <h3 class="skeleton-text"></h3>
                  <div class="timestamp">
                    <span class="skeleton-text"></span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="related-news-list">
              <div
                v-for="(news, index) in relatedNews"
                :key="news.id"
                class="related-news-item"
                @click="navigateToArticle(news.id)"
              >
                <div class="number">{{ index + 1 }}</div>
                <div class="content">
                  <div
                    class="category"
                    :class="
                      news.sport
                        .toLowerCase()
                        .replace('š', 's')
                        .replace('ć', 'c')
                    "
                  >
                    {{ news.sport }}
                  </div>
                  <h3>{{ news.title }}</h3>
                  <div class="timestamp">
                    <span>{{ news.date }}</span>
                    <div class="divider"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments section -->
        <div class="comments-section">
          <div class="comments-header">
            <div class="comments-count">
              <img
                src="@/assets/images/vector.svg"
                alt="Comment Icon"
                class="icon"
              />
              <span v-if="loading.comments" class="count skeleton-text"></span>
              <span v-else class="count">{{ totalComments }}</span>
            </div>
            <button class="comment-button" @click="toggleComments">
              {{ showComments ? "NAZAD NA VEST" : "OSTAVI KOMENTAR" }}
            </button>
          </div>
        </div>
        <NewsletterForm />
        <AdBanners />
      </div>
    </div>
  </div>
</template>

<script>
import NewsletterForm from "@/components/Newsletter.vue";
import AdBanners from "@/components/AdBanners.vue";
import NewsGrid from "@/components/NewsGrid.vue";
import CommentsPage from "@/views/CommentsPage.vue";

import SkeletonArticleHeader from "@/components/skeletons/SkeletonArticleHeader.vue";
import SkeletonArticleContent from "@/components/skeletons/SkeletonArticleContent.vue";
import SkeletonRelatedNews from "@/components/skeletons/SkeletonRelatedNews.vue";
import SkeletonNewsGrid from "@/components/skeletons/SkeletonNewsGrid.vue";

import { fetchFromApi } from "@/services/api";

export default {
  name: "ArticlePage",
  components: {
    NewsletterForm,
    AdBanners,
    NewsGrid,
    CommentsPage,
    SkeletonArticleHeader,
    SkeletonArticleContent,
    SkeletonRelatedNews,
    SkeletonNewsGrid,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showComments: false,
      article: null,
      loading: {
        article: true,
        comments: true,
        relatedNews: true,
        otherNews: true,
      },
      error: null,
      comments: [],
      commentsPagination: null,
      totalComments: 0,
      relatedNews: [],
      josVestiNews: [],
      otherNews: [],
    };
  },
  computed: {
    beforeFifthParagraph() {
      if (!this.article || !this.article.contents) return "";

      const paragraphs = this.extractParagraphs(this.article.contents);
      return paragraphs.slice(0, 4).join("");
    },
    fifthParagraph() {
      if (!this.article || !this.article.contents) return "";

      const paragraphs = this.extractParagraphs(this.article.contents);
      return paragraphs[4] || "";
    },
    afterFifthParagraph() {
      if (!this.article || !this.article.contents) return "";

      const paragraphs = this.extractParagraphs(this.article.contents);
      return paragraphs.slice(5).join("");
    },
  },
  async mounted() {
    window.scrollTo(0, 0);
    await this.fetchArticle();
    await this.fetchComments();
  },
  watch: {
    id: {
      handler() {
        window.scrollTo(0, 0);

        this.loading.comments = true;
        this.loading.relatedNews = true;
        this.loading.otherNews = true;

        this.fetchArticle();
        this.fetchComments();
      },
      immediate: false,
    },
  },
  methods: {
    async fetchArticle() {
      this.loading.article = true;
      this.error = null;

      try {
        const response = await fetchFromApi(`/getOneArticle/${this.id}`);
        this.article = response.result.article;
        this.loading.article = false;

        await this.fetchRelatedNews();
        await this.fetchOtherNews();
      } catch (error) {
        console.error("Error fetching article:", error);
        this.error = "Failed to load article";
        this.loading.article = false;
      }
    },
    async fetchRelatedNews() {
      if (!this.article || !this.article.categories) return;

      this.loading.relatedNews = true;

      try {
        // Get the sport category from the article
        const sportCategory = this.getSportFromCategories(
          this.article.categories
        );

        const articleResponse = await fetchFromApi(`/getOneArticle/${this.id}`);
        console.log(articleResponse, "articleResponse");
        const relatedArticles = articleResponse.result.relatedArticles || [];
        console.log(relatedArticles, "relatedArticles");

        if (relatedArticles.length > 0) {
          this.josVestiNews = relatedArticles.map((article) => ({
            id: article.id,
            title: article.title,
            image:
              article.images?.small?.url ||
              require("@/assets/images/image.jpg"),
            sport: sportCategory,
          }));
        } else {
          // Fallback to category-based articles if no relatedArticles
          /* const categoryId = this.article.categories.find((cat) =>
            ["Fudbal", "Košarka", "Tenis", "Odbojka"].includes(cat.name)
          )?.id;

          if (categoryId) {
            const response = await fetchFromApi(`/getArticles`, {
              "category[]": categoryId,
              articleLimit: 8,
            });

            const articles = (response.result.articles || []).filter(
              (article) => article.id !== this.id
            );

            this.josVestiNews = articles.slice(3, 7).map((article) => ({
              id: article.id,
              title: article.title,
              image:
                article.images?.small?.url ||
                require("@/assets/images/image.jpg"),
              sport: sportCategory,
            }));
          } */
          this.josVestiNews = [];
        }

        // Still fetch category-based articles for sidebar related news
        const categoryId = this.article.categories.find((cat) =>
          ["Fudbal", "Košarka", "Tenis", "Odbojka"].includes(cat.name)
        )?.id;

        if (categoryId) {
          const response = await fetchFromApi(`/getArticles`, {
            "category[]": categoryId,
            articleLimit: 8,
          });

          const articles = (response.result.articles || []).filter(
            (article) => article.id !== this.id
          );

          this.relatedNews = articles.slice(0, 3).map((article) => ({
            id: article.id,
            title: article.title,
            date: this.formatDate(article.date),
            sport: sportCategory,
          }));
        }

        this.loading.relatedNews = false;
      } catch (error) {
        console.error("Error fetching related news:", error);
        this.relatedNews = [];
        this.josVestiNews = [];
        this.loading.relatedNews = false;
      }
    },
    async fetchOtherNews() {
      if (!this.article || !this.article.categories) return;

      this.loading.otherNews = true;

      try {
        // Get the sport category from the article
        const sportCategory = this.getSportFromCategories(
          this.article.categories
        );

        // Find the category ID for API call
        const categoryId = this.article.categories.find((cat) =>
          ["Fudbal", "Košarka", "Tenis", "Odbojka"].includes(cat.name)
        )?.id;

        let response;
        if (categoryId) {
          response = await fetchFromApi(`/getArticles`, {
            "category[]": categoryId,
            articleLimit: 10,
          });
        } else {
          response = await fetchFromApi(`/getArticles`, {
            articleLimit: 10,
          });
        }

        const articles = (response.result.articles || []).filter(
          (article) => article.id !== this.article.id
        );

        this.otherNews = articles.slice(0, 8).map((article) => ({
          id: article.id,
          title: article.title,
          image: article.feat_images?.small?.url || null,
          sport: sportCategory,
        }));

        this.loading.otherNews = false;
      } catch (error) {
        console.error("Error fetching other news:", error);
        this.otherNews = [];
        this.loading.otherNews = false;
      }
    },
    async fetchComments() {
      this.loading.comments = true;

      try {
        const response = await fetchFromApi(`/getComments/${this.id}`);
        this.comments = response.result.comments || [];
        this.commentsPagination = response.result.pagination || null;
        this.totalComments = response.result.pagination?.total || 0;
        this.loading.comments = false;
      } catch (error) {
        console.error("Error fetching comments:", error);
        this.comments = [];
        this.commentsPagination = null;
        this.totalComments = 0;
        this.loading.comments = false;
      }
    },
    async handleCommentAdded() {
      await this.fetchComments();
    },
    toggleComments() {
      this.showComments = !this.showComments;
      this.$nextTick(() => {
        const targetElement = this.$refs.mainColumn;
        if (
          targetElement &&
          typeof targetElement.scrollIntoView === "function"
        ) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          try {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (e) {
            window.scrollTo(0, 0);
          }
        }
      });
    },
    getSportFromCategories(categories) {
      const sportMap = {
        Fudbal: "FUDBAL",
        Košarka: "KOŠARKA",
        Tenis: "TENIS",
        Odbojka: "ODBOJKA",
      };

      const sportCategory = categories.find((cat) => sportMap[cat.name]);
      return sportCategory ? sportMap[sportCategory.name] : "OSTALE VESTI";
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      return `${day}.${month}.${year}. ${hours}:${minutes
        .toString()
        .padStart(2, "0")}`;
    },
    navigateToArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    navigateToTag(tagId, tagName) {
      this.$router.push(`/tag/${tagId}/${encodeURIComponent(tagName)}`);
    },
    extractParagraphs(htmlContent) {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;

      // Get all elements (paragraphs, headings, etc.)
      const elements = Array.from(tempDiv.children);

      // Convert each element back to HTML string
      return elements.map((element) => element.outerHTML);
    },
    share(platform) {
      const pageUrl = window.location.href;
      const title = this.article?.title || document.title;
      const url = encodeURIComponent(pageUrl);
      const text = encodeURIComponent(title);

      const open = (shareUrl) => {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      };

      switch (platform) {
        case "facebook":
          open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
          break;
        case "twitter":
          open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
          break;
        case "whatsapp":
          open(`https://api.whatsapp.com/send?text=${text}%20${url}`);
          break;
        case "viber":
          // Works on devices with Viber installed; desktop browsers may ignore
          window.location.href = `viber://forward?text=${text}%20${url}`;
          break;
        case "instagram":
          // No web share URL; try native share, else copy link
          if (navigator.share) {
            navigator
              .share({ title, text: title, url: pageUrl })
              .catch(() => {});
          } else {
            this.copyToClipboard(pageUrl);
            alert(
              "Link copied! Open Instagram and paste it where you want to share."
            );
          }
          break;
      }
    },
    copyToClipboard(value) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    },
  },
};
</script>

<style scoped>
.article-column {
  max-width: 800px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-white);
  font-size: 18px;
}

.error-state {
  color: var(--red-primary);
}

.article-text {
  color: var(--text-white);
  font-size: 20px;
  line-height: 35px;
  width: 100%;
}

.article-text p {
  margin-bottom: 24px;
  font-family: var(--article-content);
}

.article-text h2,
.article-text h3,
.article-text h4 {
  color: var(--text-white);
  margin: 32px 0 16px 0;
}

.article-text img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 24px 0;
}

.article-text a {
  color: var(--blue-primary);
  text-decoration: underline;
  transition: var(--transition);
}

.article-text a:hover {
  opacity: var(--hover);
}

.article-header {
  text-wrap: balance;
  color: var(--text-white);
}

.article-title {
  font-family: var(--title);
  font-size: 36px;
  line-height: 48px;
  font-weight: 700;
}

.article-subtitle {
  font-family: var(--article-content);
  font-size: 20px;
  line-height: 30px;
  margin: 24px 0 30px 0;
  font-weight: 700;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  margin: 30px 0;
}

.author-date {
  font-weight: 400;
  font-size: 16px;
  line-height: 130%;
  display: flex;
  color: var(--text-25);
  flex-grow: 1;
}

.author {
  color: var(--text-white);
  font-weight: 600;
}

.comments-section {
  margin: 32px 0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-count {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.comments-count .count {
  width: 32px;
  height: 14px;
  font-weight: 600;
  font-size: 28px;
  line-height: 14px;
  color: var(--yellow-primary);
}

.comment-button {
  background-color: var(--yellow-primary);
  color: var(--text-90);
  border-radius: 4px;
  padding: 10px 40px;
  font-size: 18px;
  line-height: 32px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.comment-button:hover {
  opacity: var(--hover);
}

.share-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0;
  gap: 21.33px;
  width: 245.33px;
  height: 32px;
  flex: none;
  order: 2;
  flex-grow: 0;
}

.share-btn {
  width: 32px;
  height: 32px;
  flex: none;
  order: 0;
  flex-grow: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.featured-image {
  border-radius: 8px;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-caption {
  font-weight: 400;
  font-size: 16px;
  line-height: 130%;
  text-align: center;
  color: var(--text-25);
  margin-top: 12px;
}

.image-caption span {
  font-weight: 600;
}

.article-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0px 0px;
  gap: 32px;
}

.match-odds {
  display: flex;
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
  width: 130.67px;
  height: 74px;
  padding: 8px;
  flex: 1;
}

.odds-label {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 14px;
  line-height: 10px;
  text-align: center;
  color: var(--text-25);
}

.odds-value {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 16px;
  line-height: 10px;
  text-align: center;
  color: var(--text-white);
}

/* More News Section Styles */
h2.section-title {
  color: var(--text-white);
  border-left: 4px solid var(--text-white);
  padding-left: 8px;
}

.more-news {
  width: 100%;
  background: var(--bg-90);
  border-radius: 8px;
}

.more-news-content {
  display: flex;
  gap: 24px;
  align-items: center;
}

.text-column {
  flex: 1;
  color: var(--text-white);
  font-size: 20px;
  line-height: 1.6;
}

.text-column p {
  margin: 0;
}

.more-news-column {
  max-width: 430px;
}

.more-news-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
}

.more-news-grid .news-item {
  display: flex;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
}

.more-news-grid .news-item:hover {
  transform: translateX(4px);
}

.more-news-grid .news-item .news-image img {
  width: auto;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
}

.more-news-grid .news-item .news-title {
  color: var(--text-white);
  font-size: 16px;
  line-height: 1.4;
  font-weight: 600;
  margin: 0;
}

/* Quote Block Styles */
.quote-block {
  width: 100%;
  border: 2px solid #77b0c6;
  border-radius: 8px;
  position: relative;
  padding: 32px;
  margin: 40px 0;
}

.quote-block::before {
  content: "";
  position: absolute;
  top: -14px;
  left: 40px;
  width: 37px;
  height: 27px;
  background-image: url("@/assets/images/quote.svg");
  background-color: var(--bg-90);
  background-position: center;
  background-repeat: no-repeat;
  padding: 0 20px;
}

.quote-content {
  color: #77b0c6;
  font-size: 20px;
  line-height: 1.75;
}

.quote-content p {
  margin: 0;
}

.quote-content p + p {
  margin-top: 24px;
}

/* Tags Section Styles */
.tags-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 24px;
  flex-wrap: wrap;
  margin: 32px 0;
}

.tag {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--bg-05);
  border-radius: 100px;
  background: none;
  color: var(--bg-05);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.tag:hover {
  opacity: var(--hover);
}

/* Other News Section Styles */
.other-news-section {
  margin-top: 32px;
  width: 100%;
}

.other-news-section .news-grid {
  background: var(--bg-90);
  padding: 24px;
  border-radius: 8px;
}

.news-image {
  max-height: 75px;
}

.related-news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--dark-gradient);
  border-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  padding: 12px 24px 12px 8px;
  margin-bottom: 20px;
  border: 1px solid var(--bg-50);
  border-right: none;
}

.related-news-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
  transition: var(--transition);
}

.related-news-item:hover {
  transform: translateX(4px);
}

.number {
  font-family: var(--urbanist);
  font-size: 50px;
  line-height: 96px;
  color: var(--text-white);
  min-width: 45px;
  text-align: center;
}

.related-news-item .category {
  font-weight: 700;
  font-size: 15px;
  line-height: 19px;
  margin-bottom: 8px;
}

.related-news-item .category.fudbal {
  color: var(--green-primary);
}

.related-news-item .category.kosarka {
  color: var(--orange-primary);
}

.related-news-item .category.tenis {
  color: var(--blue-primary);
}

.related-news-item .category.odbojka {
  color: var(--red-primary);
}

.related-news-item .category.ostale-vesti {
  color: var(--text-25);
}

.related-news-item h3 {
  font-family: var(--title);
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: var(--text-white);
  margin: 0 0 10px 0;
}

.timestamp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  color: var(--text-25);
  font-size: 15px;
}

.divider {
  flex-grow: 1;
  height: 1px;
  background: var(--bg-40);
}

:deep(.article-text figure img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Skeleton loading styles */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-50) 25%,
    var(--bg-70) 50%,
    var(--bg-50) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-text {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--bg-50) 25%,
    var(--bg-70) 50%,
    var(--bg-50) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.more-news-grid .news-item .news-image.skeleton {
  width: 400px;
  height: 75px;
  border-radius: 4px;
}

.more-news-grid .news-item .news-title.skeleton-text {
  height: 20px;
  width: 100%;
  margin: 0;
}

.related-news-item .category.skeleton-text {
  width: 60px;
  height: 16px;
  margin-bottom: 8px;
}

.related-news-item h3.skeleton-text {
  width: 100%;
  height: 40px;
  margin: 0 0 10px 0;
}

.related-news-item .timestamp .skeleton-text {
  width: 80px;
  height: 14px;
}

.comments-count .count.skeleton-text {
  width: 32px;
  height: 20px;
  display: inline-block;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--bg-50) 25%,
    var(--bg-70) 50%,
    var(--bg-50) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

:deep(strong) {
  font-family: var(--article-content);
}

:deep(.article-content p) {
  font-family: var(--article-content);
}

:deep(.article-text) {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

:deep(
    figure.wp-block-embed.is-type-video.is-provider-youtube.wp-block-embed-youtube.wp-embed-aspect-16-9.wp-has-aspect-ratio
  ) {
  text-align: center;
}

:deep(iframe) {
  width: 100%;
}

:deep(.wp-block-embed__wrapper) {
  display: flex;
  justify-content: center;
}

:deep(.article-content a) {
  color: var(--yellow-primary);
  text-decoration: underline;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .article-page {
    overflow-x: hidden;
  }

  .article-column {
    max-width: 100%;
  }

  .more-news-content {
    flex-direction: column;
  }

  .tags-section {
    gap: 16px;
  }
}

@media (max-width: 608px) {
  .author-date {
    flex-basis: 100%;
  }

  .comments-count a {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .share-buttons {
    width: fit-content;
    gap: 16px;
  }
}
</style>
