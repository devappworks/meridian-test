<template>
  <div class="ad-banners-container">
    <!-- Top banner placeholders (colored boxes) -->
    <div class="ad-section top-banners">
      <div v-if="topBanners.length > 0" class="ad-banner test1">
        <a
          :href="topBanners[0].url_link"
          target="_blank"
          class="banner-link"
        >
          <img
            :src="topBanners[0].creative_image"
            :alt="topBanners[0].name"
            class="ad-banner-image"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
      <div v-else class="ad-banner">
        <img
          src="../assets/images/image18.jpg"
          alt="Ad Banner"
          class="ad-banner-image"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div v-if="topBanners.length > 1" class="ad-banner test2">
        <a :href="topBanners[1].url_link" target="_blank" class="banner-link">
          <img
            :src="topBanners[1].creative_image"
            :alt="topBanners[1].name"
            class="ad-banner-image"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
      <div v-else class="ad-banner">
        <img
          src="../assets/images/image19.jpg"
          alt="Ad Banner"
          class="ad-banner-image"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>

    <!-- Bottom video placeholders -->
    <!-- <div class="ad-section bottom-banners">
      <div class="ad-banner video-placeholder">
        <div class="video-mock">
          <div class="play-button">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.5)" />
              <path d="M32 24L18 32V16L32 24Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
      <div class="ad-banner video-placeholder">
        <div class="video-mock">
          <div class="play-button">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.5)" />
              <path d="M32 24L18 32V16L32 24Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { fetchOrders } from "../services/api.js";

export default {
  name: "AdBanners",
  setup() {
    const topBanners = ref([]);

    const loadBanners = async () => {
      try {
        const response = await fetchOrders();
        if (response.success && response.result.orders.data) {
          const squareBanners = response.result.orders.data.filter(
            (order) => order.format === "web_square" && order.status === 1
          );
          topBanners.value = squareBanners;
        }
      } catch (error) {
        console.error("Error loading ad banners:", error);
      }
    };

    onMounted(() => {
      loadBanners();
    });

    return {
      topBanners,
    };
  },
};
</script>

<style scoped>
.ad-banners-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
}

.ad-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ad-banner {
  width: 100%;
  height: fit-content;
  border-radius: 8px;
  overflow: hidden;
}

.banner-link {
  display: block;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.banner-link:hover {
  opacity: 0.8;
}

.ad-banner-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.video-placeholder {
  background-color: #333;
  height: 200px;
  position: relative;
}

.video-mock {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button {
  cursor: pointer;
}
</style>
