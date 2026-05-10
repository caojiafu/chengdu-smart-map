<template>
  <div class="app-container">
    <MapView />
  </div>
</template>

<script setup lang="ts">
import MapView from '@/views/MapView.vue'
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
