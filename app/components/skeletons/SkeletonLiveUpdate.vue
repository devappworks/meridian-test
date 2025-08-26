<template>
  <div
    class="live-update"
    :class="{ highlight: isHighlight, skeleton: skeleton }"
  >
    <div class="time-column">
      <span v-if="!skeleton" class="time">{{ time }}</span>
      <div v-else class="skeleton-time skeleton-container-gradient"></div>
    </div>
    <div class="content-column">
      <h3 v-if="!skeleton" class="title">{{ title }}</h3>
      <div v-else class="skeleton-title skeleton-container-gradient"></div>

      <p v-if="!skeleton" class="content" v-html="content"></p>
      <div v-else class="skeleton-content">
        <div
          class="skeleton-line skeleton-container-gradient skeleton-text-lg"
        ></div>
        <div
          class="skeleton-line skeleton-container-gradient skeleton-text-lg"
        ></div>
        <div
          class="skeleton-line skeleton-container-gradient skeleton-text-lg short"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LiveUpdate",
  props: {
    time: {
      type: String,
      required: false,
      default: "",
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
    content: {
      type: String,
      required: false,
      default: "",
    },
    isHighlight: {
      type: Boolean,
      default: false,
    },
    skeleton: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
@import "@/assets/skeleton-styles.css";

.live-update {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 0px 16px 12px;
  width: 100%;
  background: linear-gradient(270deg, var(--bg-70) 0%, var(--bg-90) 100%);
  border-radius: 8px;
  font-weight: 800;
  font-size: 20px;
  line-height: 23px;
  color: var(--bg-05);
}

.live-update.highlight {
  background: #223b46;
}

.time-column {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 12px 0px 0px;
  width: 64px;
}

.content-column {
  flex: 1;
  padding: 0 12px;
  border-left: 1px solid #223b46;
}

.title {
  font-size: 20px;
  font-weight: 800;
}

.content {
  color: var(--text-white);
  margin: 0;
  font-weight: 400;
}

/* Skeleton styles */
.live-update.skeleton {
  pointer-events: none;
}

.skeleton-time {
  width: 40px;
  height: 20px;
}

.skeleton-title {
  width: 60%;
  height: 23px;
  margin-bottom: 8px;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
