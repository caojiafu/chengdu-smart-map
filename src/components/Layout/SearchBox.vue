<template>
  <div class="search-container">
    <el-input
      v-model="searchKeyword"
      placeholder="搜索区县（如：锦江）"
      clearable
      :prefix-icon="Search"
      class="search-input"
      @keyup.enter="handleSearch(searchKeyword)"
    >
    </el-input>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { Map } from 'ol'
import { storeToRefs } from 'pinia'
import { useSearchTools } from '@/hooks/useSearchTools'
import { useMapStore } from '@/stores/map'
import { type Ref } from 'vue'
// 本地搜索关键词，用于 v-model 绑定
const searchKeyword = ref('')
const mapStore = useMapStore()
const { mapInstance } = storeToRefs(mapStore)
const { handleSearch } = useSearchTools(mapInstance as Ref<Map | null>)
</script>
<style scoped>
.search-container {
  position: absolute;
  top: 10px;
  left: 50%; /* 居中 */
  transform: translateX(-50%);
  z-index: 1000;
  width: 80%;
}
.search-input {
  :deep(.el-input__wrapper) {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    border-radius: 20px;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.95);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 1);
    }

    &.is-focus {
      box-shadow: 0 4px 16px rgba(22, 119, 255, 0.3);
      background: rgba(255, 255, 255, 1);
    }
  }

  :deep(.el-input__inner) {
    font-size: 14px;
  }
}
</style>
