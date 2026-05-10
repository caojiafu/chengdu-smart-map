<template>
  <div class="left-suspended-panel">
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
      <el-radio-button :value="false">展开</el-radio-button>
      <el-radio-button :value="true">折叠</el-radio-button>
    </el-radio-group>
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @select="handleMenuSelect"
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon><icon-menu /></el-icon>
          <span>工具</span>
        </template>
        <el-menu-item-group>
          <el-sub-menu index="1-1">
            <template #title><span>绘制工具</span></template>
            <el-menu-item index="draw-point">点</el-menu-item>
            <el-menu-item index="draw-line">线</el-menu-item>
            <el-menu-item index="draw-polygon">面</el-menu-item>
            <el-menu-item index="draw-clear">清除所有</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="1-2">
            <template #title><span>测量工具</span></template>
            <el-menu-item index="measure-length">测量长度</el-menu-item>
            <el-menu-item index="measure-area">测量面积</el-menu-item>
            <el-menu-item index="measure-stop">停止测量</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="1-3">
            <template #title><span>分析工具</span></template>
            <el-menu-item index="buffer-analysis">缓冲区分析</el-menu-item>
            <el-menu-item index="heatmap">热力图分析</el-menu-item>
            <el-menu-item index="buffer-clear">清除缓冲区</el-menu-item>
          </el-sub-menu>
        </el-menu-item-group>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Menu as IconMenu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMapStore } from '@/stores/map'

const isCollapse = ref(true)
// // const handleOpen = (key: string, keyPath: string[]) => {
// //   console.log(key, keyPath)
// // }
// // const handleClose = (key: string, keyPath: string[]) => {
// //   console.log(key, keyPath)
// }
const mapStore = useMapStore()
const drawTools = computed(() => mapStore.drawToolsInstance)

function handleMenuSelect(index: string) {
  const dt = drawTools.value
  if (!dt) {
    ElMessage.warning('地图尚未就绪')
    return
  }
  switch (index) {
    // 绘制工具
    case 'draw-point':
      dt.startDraw('Point')
      break
    case 'draw-line':
      dt.startDraw('LineString')
      break
    case 'draw-polygon':
      dt.startDraw('Polygon')
      break
    case 'draw-clear':
      dt.clearDrawings()
      break
    // 测量工具
    case 'measure-length':
      dt.startMeasureLength()
      break
    case 'measure-area':
      dt.startMeasureArea()
      break
    case 'measure-stop':
      dt.stopAllInteractions()
      break
    // 分析工具
    case 'buffer-analysis':
      if (dt.runBufferAnalysis()) {
        ElMessage.success('缓冲区分析已完成')
      } else {
        ElMessage.warning('缓冲区分析失败，请先使用绘制或测量工具画一个面或线')
      }
      break
    case 'heatmap':
      ElMessage.info('热力图已自动加载，可通过图层切换控件控制显示')
      break
    case 'buffer-clear':
      dt.clearBuffer()
      ElMessage.success('缓冲区已清除')
      break
    default:
      break
  }
}
</script>

<style scoped>
.left-suspended-panel {
  position: fixed;
  top: 80px;
  left: 10px;
  z-index: 901;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 0;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  transition: all 0.3s ease;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  background: white !important;
  border: none;
}

.el-menu--collapse {
  width: 64px;
}

:deep(.el-menu) {
  background: white !important;
  border-right: none;
}

:deep(.el-sub-menu .el-sub-menu__title),
:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
}

@media (max-width: 768px) {
  .left-suspended-panel {
    top: 70px;
    left: 5px;
    max-height: calc(100vh - 150px);
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 180px;
  }
}
</style>
