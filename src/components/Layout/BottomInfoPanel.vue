<!-- src/components/Layout/BottomInfoPanel.vue -->
<template>
  <div class="bottom-panel" :class="{ expanded: isExpanded }">
    <div class="panel-header" @click="isExpanded = !isExpanded">
      <div class="header-content">
        <span class="icon">📍</span>
        <span class="title">{{ selectedPlace?.name || '点击地图选择区县' }}</span>
      </div>
      <span class="toggle-icon">{{ isExpanded ? '▼' : '▲' }}</span>
    </div>

    <div class="panel-content" v-if="isExpanded">
      <div class="info-section">
        <div class="info-row">
          <span class="label">面积:</span>
          <span class="value">{{ selectedPlace?.area?.toFixed(2) || '-' }} km²</span>
        </div>
        <div class="info-row">
          <span class="label">人口:</span>
          <span class="value">{{ selectedPlace?.population?.toFixed(2) || '-' }} 万人</span>
        </div>
        <div class="info-row">
          <span class="label">GDP:</span>
          <span class="value">{{ selectedPlace?.gdp?.toFixed(2) || '-' }} 亿元</span>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" size="small" @click="handleShare">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-button size="small" @click="handleCopy">
          <el-icon><DocumentCopy /></el-icon>
          复制数据
        </el-button>
        <el-button size="small" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, DocumentCopy, Download } from '@element-plus/icons-vue'
import type { DataItem } from '@/hooks/useData'

interface Props {
  selectedPlace: DataItem | null
}

const props = defineProps<Props>()

const isExpanded = ref(false)

watch(
  () => props.selectedPlace,
  () => {
    // 选中新的地点时自动展开
    if (props.selectedPlace) {
      isExpanded.value = true
    }
  },
)

const handleShare = () => {
  if (!props.selectedPlace) return
  const text = `${props.selectedPlace.name} - 面积: ${props.selectedPlace.area}km², 人口: ${props.selectedPlace.population}万人, GDP: ${props.selectedPlace.gdp}亿元`
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

const handleCopy = () => {
  if (!props.selectedPlace) return
  const data = JSON.stringify(props.selectedPlace, null, 2)
  navigator.clipboard.writeText(data)
  ElMessage.success('数据已复制')
}

const handleExport = () => {
  if (!props.selectedPlace) return
  const data = JSON.stringify(props.selectedPlace, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.selectedPlace.name}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出')
}
</script>

<style scoped>
.bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
  z-index: 900;
  max-height: 70px;
  transition: max-height 0.3s ease;
  border-top: 1px solid #f0f0f0;
}

.bottom-panel.expanded {
  max-height: 320px;
}

.panel-header {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.icon {
  font-size: 18px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s ease;
}

.panel-content {
  padding: 16px 20px;
  max-height: 250px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons :deep(.el-button) {
  flex: 1;
}

@media (max-width: 768px) {
  .bottom-panel {
    max-height: 60px;
  }

  .bottom-panel.expanded {
    max-height: 280px;
  }

  .panel-header {
    padding: 10px 16px;
  }

  .title {
    font-size: 13px;
  }

  .panel-content {
    padding: 12px 16px;
  }
}
</style>
