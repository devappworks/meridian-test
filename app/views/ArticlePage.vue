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
                <p>Od
                  <span class="author" v-if="article.authors[0].name"
                    > {{ article.authors[0].name }}</span
                  ><span v-else>Redakcija</span> -
                  {{ formatDate(article.date || article.publish_date) }}
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
              :article-id="article?.id || ''"
              :comments="comments"
              :pagination="commentsPagination"
              :has-multiple-pages="hasMultipleCommentPages"
              :loading-all-comments="loading.allComments"
              :showing-all-comments="showingAllComments"
              @comment-added="handleCommentAdded"
              @load-all-comments="loadAllComments"
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
                {{ article.featured_image_caption }}
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
                    <div v-if="loading.josVestiNews" class="more-news-grid">
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
              <!-- <div class="quote-block">
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
              </div> -->

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
                    background=true
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
                      news.category
                        .toLowerCase()
                        .replace('š', 's')
                        .replace('ć', 'c')
                    "
                  >
                    {{ news.categoryName.toUpperCase() }}
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

<script setup>
import NewsletterForm from "@/components/Newsletter.vue";
import AdBanners from "@/components/AdBanners.vue";
import NewsGrid from "@/components/NewsGrid.vue";
import CommentsPage from "@/views/CommentsPage.vue";

import SkeletonArticleHeader from "@/components/skeletons/SkeletonArticleHeader.vue";
import SkeletonArticleContent from "@/components/skeletons/SkeletonArticleContent.vue";
import SkeletonRelatedNews from "@/components/skeletons/SkeletonRelatedNews.vue";
import SkeletonNewsGrid from "@/components/skeletons/SkeletonNewsGrid.vue";

import { fetchFromApi, fetchAllComments } from "@/services/api";

// Nuxt composables
const nuxtApp = useNuxtApp();

// SSR Detection - This runs on both server and client
console.log("🟢 ArticlePage setup() - SSR check:", {
  server: process.server,
  client: process.client
});

if (process.server) {
  console.log("🟢 This is running on the SERVER! SSR is working!");
}

if (process.client) {
  console.log("🟢 This is running on the CLIENT! Hydration happening!");
}

// Props
const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  article: {
    type: Object,
    default: null,
  },
});

// Reactive data
const showComments = ref(false);
const article = ref(props.article || null);
const loading = ref({
  article: !props.article, // Don't show loading if we already have article data
  comments: true,
  relatedNews: true,
  otherNews: true,
  allComments: false, // Loading state for fetching all comments
});
const error = ref(null);
const comments = ref([]);
const commentsPagination = ref(null);
const totalComments = ref(0);
const showingAllComments = ref(false); // Track if all comments are loaded
const relatedNews = ref([]);
const josVestiNews = ref([]);
const otherNews = ref([]);

// Template refs
const mainColumn = ref(null);

// Computed properties
const beforeFifthParagraph = computed(() => {
  if (!article.value || !article.value.contents) return "";

  const paragraphs = extractParagraphs(article.value.contents);
  return paragraphs.slice(0, 4).join("");
});

const fifthParagraph = computed(() => {
  if (!article.value || !article.value.contents) return "";

  const paragraphs = extractParagraphs(article.value.contents);
  return paragraphs[4] || "";
});

const afterFifthParagraph = computed(() => {
  if (!article.value || !article.value.contents) return "";

  const paragraphs = extractParagraphs(article.value.contents);
  return paragraphs.slice(5).join("");
});

// Check if there are multiple pages of comments
const hasMultipleCommentPages = computed(() => {
  return commentsPagination.value && 
         commentsPagination.value.last_page > 1 && 
         !showingAllComments.value;
});


console.log(article.value, "THIS ONE ARTICLE")
// Dynamic meta tags that update based on article data
useSeoMeta({
  title: () => article.value?.title || 'Article - Meridian',
  description: () => {
    if (!article.value?.contents) return 'Read the latest sports news and updates on Meridian';
    
    // Extract text content from HTML and create a description - SSR safe
    let textContent;
    if (typeof document === 'undefined') {
      // Server-side: strip HTML tags with regex
      textContent = article.value.contents.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Client-side: use DOM parsing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.value.contents;
      textContent = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    // Return first 160 characters for SEO description
    return textContent.substring(0, 160).trim() + (textContent.length > 160 ? '...' : '');
  },
  ogTitle: () => article.value?.title || 'Article - Meridian',
  ogDescription: () => {
    if (!article.value?.contents) return 'Read the latest sports news and updates on Meridian';
    
    // SSR-safe text extraction
    let textContent;
    if (typeof document === 'undefined') {
      // Server-side: strip HTML tags with regex
      textContent = article.value.contents.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Client-side: use DOM parsing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.value.contents;
      textContent = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    return textContent.substring(0, 160).trim() + (textContent.length > 160 ? '...' : '');
  },
  ogImage: () => article.value?.images?.large?.url || '/meridian-logo.svg',
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: () => article.value?.title || 'Article - Meridian',
  twitterDescription: () => {
    if (!article.value?.contents) return 'Read the latest sports news and updates on Meridian';
    
    // SSR-safe text extraction
    let textContent;
    if (typeof document === 'undefined') {
      // Server-side: strip HTML tags with regex
      textContent = article.value.contents.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Client-side: use DOM parsing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.value.contents;
      textContent = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    return textContent.substring(0, 160).trim() + (textContent.length > 160 ? '...' : '');
  },
  twitterImage: () => article.value?.images?.large?.url || '/meridian-logo.svg',
});

// Methods
const fetchArticle = async () => {
  loading.value.article = true;
  error.value = null;

  try {
    console.log("🔴 ArticlePage fetchArticle called with:", {
      category: props.category,
      slug: props.slug,
      route: useRoute().path,
      params: useRoute().params
    });
    
    // Check if category and slug are valid before making API call
    if (!props.category || !props.slug) {
      console.error("🔴 ArticlePage: category or slug is missing!", {
        category: props.category,
        slug: props.slug
      });
      error.value = "Invalid article URL";
      loading.value.article = false;
      return;
    }
    
    const response = await fetchFromApi(`/getArticlesBySlug/${props.category}/${props.slug}`);
    console.log("🔴 ArticlePage API response:", response);
    article.value = response.article;
    console.log(article.value, "FETCHED ARTICLE VALUE");
    console.log(article.value.relatedArticle, "FETCHED ARTICLE RELATED ARTICLE");
    loading.value.article = false;

    await fetchRelatedNews();
    await fetchOtherNews();
  } catch (error) {
    console.error("🔴 ArticlePage Error fetching article:", error);
    error.value = "Failed to load article";
    loading.value.article = false;
  }
};

const fetchRelatedNews = async () => {
  if (!article.value || !article.value.categories) return;

  loading.value.relatedNews = true;

  try {
    // Get the sport category from the article
    const sportCategory = getSportFromCategories(
      article.value.categories
    );

    const relatedArticles = article.value.relatedArticle || [];
    console.log(relatedArticles, "RELATED ARTICLES");

    if (relatedArticles.length > 0) {
      console.log(josVestiNews, "JOS VESTI NEWS");
      josVestiNews.value = relatedArticles.map((article) => ({
        id: article.id,
        title: article.title,
        image:
          article.images?.small?.url ||
          require("@/assets/images/image.jpg"),
        sport: sportCategory,
        url: article.url || null,
        category: article.categories[0].slug,
        slug: article.slug,
      }));
    } else {
      josVestiNews.value = [];
    }

    // Still fetch category-based articles for sidebar related news
    const categoryId = article.value.categories.find((cat) =>
      ["Fudbal", "Košarka", "Tenis", "Odbojka"].includes(cat.name)
    )?.id || article.value.categories[0].id;

    const response = await fetchFromApi(`/getArticles`, {
      "category[]": categoryId,
      articleLimit: 8,
    });

    const articles = (response.result.articles || []).filter(
      (article) => article.slug !== props.slug
    );

    relatedNews.value = articles.slice(0, 3).map((article) => ({
      id: article.id,
      title: article.title,
      date: formatDate(article.date || article.publish_date),
      sport: sportCategory,
      url: article.url || null,
      category: article.categories[0].slug,
      categoryName: article.categories[0].name,
      slug: article.slug,
    }));

    loading.value.relatedNews = false;
  } catch (error) {
    console.error("Error fetching related news:", error);
    relatedNews.value = [];
    josVestiNews.value = [];
    loading.value.relatedNews = false;
  }
};

const fetchOtherNews = async () => {
  if (!article.value || !article.value.categories) return;

  loading.value.otherNews = true;

  try {
    // Get the sport category from the article
    const sportCategory = getSportFromCategories(
      article.value.categories
    );

    // Find the category ID for API call
    const categoryId = article.value.categories.find((cat) =>
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
      (articleItem) => articleItem.id !== article.value.id
    );

    otherNews.value = articles.slice(0, 8).map((article) => ({
      id: article.id,
      title: article.title,
      image: article.feat_images?.small?.url || null,
      sport: sportCategory,
      url: article.url || null,
      category: article.categories[0].slug,
      slug: article.slug,
    }));

    loading.value.otherNews = false;
  } catch (error) {
    console.error("Error fetching other news:", error);
    otherNews.value = [];
    loading.value.otherNews = false;
  }
};

const fetchComments = async () => {
  loading.value.comments = true;

  try {
    // We need the article id to fetch comments, so we need to fetch the article first
    if (!article.value || !article.value.id) {
      loading.value.comments = false;
      return;
    }
    
    const response = await fetchFromApi(`/getComments/${article.value.id}`);
    comments.value = response.result.comments || [];
    commentsPagination.value = response.result.pagination || null;
    totalComments.value = response.result.pagination?.total || 0;
    loading.value.comments = false;
  } catch (error) {
    console.error("Error fetching comments:", error);
    comments.value = [];
    commentsPagination.value = null;
    totalComments.value = 0;
    loading.value.comments = false;
  }
};

const handleCommentAdded = async () => {
  // If we're showing all comments, refetch all, otherwise just fetch first page
  if (showingAllComments.value) {
    await loadAllComments();
  } else {
    await fetchComments();
  }
};

// Function to load all comments from all pages
const loadAllComments = async () => {
  loading.value.allComments = true;

  try {
    // We need the article id to fetch comments
    if (!article.value || !article.value.id) {
      loading.value.allComments = false;
      return;
    }
    
    const response = await fetchAllComments(article.value.id);
    comments.value = response.result.comments || [];
    commentsPagination.value = response.result.pagination || null;
    totalComments.value = response.result.pagination?.total || 0;
    showingAllComments.value = true;
    loading.value.allComments = false;
  } catch (error) {
    console.error("Error fetching all comments:", error);
    // Fall back to regular comment fetching
    await fetchComments();
    loading.value.allComments = false;
  }
};

const toggleComments = () => {
  showComments.value = !showComments.value;
  nextTick(() => {
    const targetElement = mainColumn.value;
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
};

const getSportFromCategories = (categories) => {
  const sportMap = {
    Fudbal: "FUDBAL",
    Košarka: "KOŠARKA",
    Tenis: "TENIS",
    Odbojka: "ODBOJKA",
  };

  const sportCategory = categories.find((cat) => sportMap[cat.name]);
  return sportCategory ? sportMap[sportCategory.name] : "OSTALE VESTI";
};

const formatDate = (dateString) => {
  console.log(dateString, "dateString");
  // Robustly parse multiple possible input formats and avoid NaN
  if (!dateString) return "";

  let date;
  if (typeof dateString === "number") {
    // Treat numbers as epoch milliseconds or seconds
    const ms = dateString > 1e12 ? dateString : dateString * 1000;
    date = new Date(ms);
  } else if (typeof dateString === "string") {
    const trimmed = dateString.trim();
    // Handle dd.MM.yyyy. HH:mm or dd.MM.yyyy HH:mm
    const dmYhm = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\s+(\d{1,2}):(\d{2})$/;
    const dmY = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/;
    // Handle dd/MM/yyyy[, HH:mm]
    const dmySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?$/;
    // Handle MySQL style: YYYY-MM-DD HH:mm:ss (or with 'T')
    const ymdHms = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
    let m = trimmed.match(dmySlash);
    if (m) {
      const [_, d, mth, y, h, min] = m;
      date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h || 0), Number(min || 0));
    } else if ((m = trimmed.match(dmYhm))) {
      const [_, d, mth, y, h, min] = m;
      date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h), Number(min));
    } else if ((m = trimmed.match(dmY))) {
      const [_, d, mth, y] = m;
      date = new Date(Number(y), Number(mth) - 1, Number(d));
    } else if ((m = trimmed.match(ymdHms))) {
      const [_, y, mth, d, h, min, s] = m;
      date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h), Number(min), Number(s || 0));
    } else {
      // Normalize ISO with microseconds to milliseconds (keep only 3 fractional digits)
      const normalized = trimmed.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})$/, ".$1$2");
      // Fallback to native parser (ISO 8601, RFC 2822, etc.)
      date = new Date(normalized);
    }
  } else {
    date = new Date(dateString);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}. ${hours}:${minutes}`;
};

const navigateToArticle = (id) => {
  console.log("🔴 ArticlePage navigateToArticle called!", {
    id,
    category: props.category,
    slug: props.slug
  });
  
  const foundInJos = josVestiNews.value.find((a) => a.id === id)
  console.log(foundInJos, "FOUND IN JOS");
  const foundInRelated = relatedNews.value.find((a) => a.id === id)
  console.log(foundInRelated, "FOUND IN RELATED");
  const target = `/${foundInJos.category}/${foundInJos.slug}` || `/${foundInRelated.category}/${foundInRelated.slug}`;
  console.log(target, "TARGET");
  
  console.log("🔴 ArticlePage navigating to:", target);
  useRouter().push(target)
};

const navigateToTag = (tagId, tagName) => {
  useRouter().push(`/tag/${tagId}/${encodeURIComponent(tagName)}`);
};

const extractParagraphs = (htmlContent) => {
  // Server-side safe paragraph extraction
  if (typeof document === 'undefined') {
    // On server side, use simple regex to split by paragraph tags
    return htmlContent.split(/<\/(?:p|h[1-6]|div)>/i)
      .map(part => part.trim())
      .filter(part => part && part.includes('<'))
      .map(part => part + (part.match(/<(?:p|h[1-6]|div)/i) ? part.match(/<\/(?:p|h[1-6]|div)>/i)?.[0] || '</p>' : '</p>'));
  }
  
  // Client side with proper DOM parsing
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const elements = Array.from(tempDiv.children);
  return elements.map((element) => element.outerHTML);
};

const share = (platform) => {
  // Client-side only function
  if (typeof window === 'undefined') return;
  
  const pageUrl = window.location.href;
  const title = article.value?.title || document.title;
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
        copyToClipboard(pageUrl);
        alert(
          "Link copied! Open Instagram and paste it where you want to share."
        );
      }
      break;
  }
};

const copyToClipboard = (value) => {
  // Client-side only function
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
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
};

// Lifecycle hooks
onMounted(async () => {
  console.log("🔴 ArticlePage mounted with props:", {
    category: props.category,
    slug: props.slug,
    route: useRoute(),
    routePath: useRoute().path,
    routeParams: useRoute().params,
    isSSR: process.server,
    isClient: process.client
  });
  
  // SSR Debug - this should show true on server, false on client
  console.log("🔴 SSR Status:", {
    server: process.server,
    client: process.client,
    isHydrating: nuxtApp.isHydrating
  });
  
  // Only scroll on client side to prevent SSR mismatch
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  
  // Only fetch article if we don't already have it from SSR
  if (!props.article) {
    await fetchArticle();
  } else {
    // If we have article data from props, still need to fetch related content
    await fetchRelatedNews();
    await fetchOtherNews();
  }
  await fetchComments();
});

// Watchers
watch(() => props.category, () => {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  loading.value.comments = true;
  loading.value.relatedNews = true;
  loading.value.otherNews = true;

  fetchArticle();
  fetchComments();
});

watch(() => props.slug, () => {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  loading.value.comments = true;
  loading.value.relatedNews = true;
  loading.value.otherNews = true;

  fetchArticle();
  fetchComments();
});
</script>

<style scoped>
.category {
  color: var(--yellow-primary);
}

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

.comments-count a {
  display: flex;
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
  border-radius: 8px;
}

.image-caption {
  font-weight: 400;
  font-size: 16px;
  line-height: 130%;
  text-align: end;
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

.sidebar-header h3 {
  font-size: 24px;
  border-left: 4px solid var(--text-white);
  padding-left: 12px;
  margin-bottom: 16px;
}

.content {
  width: 100%;
}

.divider {
  margin: 0 8px;
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
