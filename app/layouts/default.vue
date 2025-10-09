<template>
  <div class="page-shell">
    <div class="side-banner left-banner">
      <div v-if="leftBanners.length > 0" class="banner-container">
        <a
          v-for="(banner, index) in leftBanners"
          :key="banner.id"
          :href="banner.url_link"
          target="_blank"
          rel="noopener noreferrer"
          class="banner-link"
        >
          <img
            :src="banner.creative_image"
            :alt="banner.name"
            class="banner-image"
            fetchpriority="low"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
      <div v-else class="banner-placeholder"></div>
    </div>

    <div class="main-content">
      <Header />
      <main class="page-layout">
        <div class="container">
          <slot />
        </div>
      </main>
      <Footer />
    </div>

    <div class="side-banner right-banner">
      <div v-if="rightBanners.length > 0" class="banner-container">
        <a
          v-for="(banner, index) in rightBanners"
          :key="banner.id"
          :href="banner.url_link"
          target="_blank"
          rel="noopener noreferrer"
          class="banner-link"
        >
          <img
            :src="banner.creative_image"
            :alt="banner.name"
            class="banner-image"
            fetchpriority="low"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
      <div v-else class="banner-placeholder"></div>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

// Use shared composable to prevent duplicate API calls
const { skyscraperBanners } = useOrders();

// Split skyscraper banners for left and right sides
const leftBanners = computed(() => {
  const banners = skyscraperBanners.value || [];
  const midPoint = Math.ceil(banners.length / 2);
  return banners.slice(0, midPoint);
});

const rightBanners = computed(() => {
  const banners = skyscraperBanners.value || [];
  const midPoint = Math.ceil(banners.length / 2);
  return banners.slice(midPoint);
});
</script>

<style scoped>
.page-shell {
  display: flex;
  position: relative;
  justify-content: center;
}

.main-content {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.page-layout {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
}

.side-banner {
  width: 250px;
  flex-shrink: 0;
  position: sticky;
  top: 0px;
  height: fit-content;
}

.banner-placeholder {
  background-color: var(--bg-70);
  border: 1px solid var(--bg-40);
  height: 100vh;
}

.banner-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-link {
  display: block;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.banner-link:hover {
  opacity: 0.8;
}

.banner-image {
  width: 100%;
  height: auto;
  display: block;
}

.page-layout > .container {
  margin: unset;
  flex: 1;
  width: calc(100vw - 500px);
}

@media screen and (max-width: 1440px) {
  .side-banner {
    display: none;
  }
  .page-layout > .container {
    width: 100%;
  }
}
</style>
