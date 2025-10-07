<template>
  <div class="live-stream">
    <div v-if="banners.length > 0" class="banner-container">
      <a
        v-for="banner in banners"
        :key="banner.id"
        :href="banner.url_link"
        target="_blank"
        rel="noopener noreferrer"
        class="banner-link"
      >
        <img
          :src="banner.creative_image"
          :alt="banner.name"
          class="live-stream-banner"
        />
      </a>
    </div>
    <img
      v-else
      :src="fallbackImage"
      alt="Live Stream"
      class="live-stream-banner"
    />
  </div>
</template>

<script setup>
import fallbackImage from "@/assets/images/image17.jpg";

// Use shared composable to prevent duplicate API calls
const { leaderboardBanners: banners } = useOrders();
</script>

<style scoped>
.live-stream {
  padding: 10px 0;
  width: 100%;
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

.live-stream-banner {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}
</style>
