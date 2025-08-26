<template>
  <div class="youtube-section">
    <div class="section-header">
      <div class="section-title">
        <h2>{{ mappedVideos[0]?.title }}</h2>
      </div>
    </div>
    <div class="youtube-content">
      <img :src="mappedVideos[0]?.thumbnail" alt="Youtube video" class="youtube-thumb" />
    </div>
  </div>
</template>

<script>
import { fetchFromApi } from '@/services/api'
export default {
  name: 'YouTubeSection',
  data() {
    return {
      youtubeVideo: null
    }
  },
  computed: {
    mappedVideos() {
      if (!this.youtubeVideo?.result?.videos) return []
      return this.mapYoutubeVideo()
    }
  },
  async mounted() {
    this.youtubeVideo = await fetchFromApi('getYoutubeVideo')
  },
  methods: {
    mapYoutubeVideo() {
      return this.youtubeVideo.result.videos.map(video => {
        return {
          title: video.title,
          thumbnail: video.imageHigh
        }
      })
    }
  },
}
</script>

<style scoped>
.youtube-section {
  padding: 24px 0;
  padding-top: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.section-title {
  position: relative;
  padding-left: 12px;
  border-left: 4px solid var(--text-white);
}

.section-title h2 {
  font-weight: 600;
  font-size: 24px;
  line-height: 26px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  color: var(--text-white);
}

.youtube-content {
  width: 100%;
  padding: 30px 22px;
  background: #222;
  border-radius: 8px;
}

.youtube-thumb {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0px 0px 20px hsl(5 99% 60% / 1);
}
</style> 