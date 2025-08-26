<template>
  <div class="live-update" :class="{ highlight: isHighlight }">
    <div class="time-column">
      <span class="time">{{ time }}</span>
    </div>
    <div class="content-column">
      <h3 class="title">{{ title }}</h3>
      <p class="content">{{ content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LiveUpdate",
  props: {
    time: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isHighlight: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
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
</style>
