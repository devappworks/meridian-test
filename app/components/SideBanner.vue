<template>
    <div class="side-banner">    <img src="../assets/images/image.jpg" alt="Meridian Sport" class="banner-image" />  </div>
</template>

<script>
export default {
  name: 'SideBanner'
}
</script>

<style scoped>
.side-banner {
  position: fixed;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240px;
  z-index: 10;
}

.side-banner.left {
  left: 0;
}

.side-banner.right {
  right: 0;
}

.banner-image {
  width: 100%;
  height: auto;
}

@media screen and (max-width: 1720px) {
  .side-banner {
    display: none;
  }
}
</style> 