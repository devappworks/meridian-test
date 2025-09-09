<template>
  <div class="live-stream">
    <div v-if="banners.length > 0" class="banner-container">
      <a
        v-for="banner in banners"
        :key="banner.id"
        :href="banner.url_link"
        target="_blank"
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

<script>
import { ref, onMounted } from "vue";
import { fetchOrders } from "../services/api.js";
import fallbackImage from "@/assets/images/image17.jpg";

export default {
  name: "LiveStream",
  setup() {
    const banners = ref([]);

    const loadBanners = async () => {
      try {
        const response = await fetchOrders();
        if (response.success && response.result.orders.data) {
          const leaderboardBanners = response.result.orders.data.filter(
            (order) =>
              order.format === "web_large_leaderboard" && order.status === 1
          );
          banners.value = leaderboardBanners;
        }
      } catch (error) {
        console.error("Error loading live stream banners:", error);
      }
    };

    onMounted(() => {
      loadBanners();
    });

    return {
      banners,
      fallbackImage,
    };
  },
};
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
