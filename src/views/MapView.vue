<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="data-view-map" class="map-wrapper"></div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="map-loading-overlay">
      <div class="map-loading-spinner"></div>
      <span>地图数据加载中...</span>
    </div>

    <!-- 错误提示条 -->
    <div v-if="dataError" class="map-error-banner">
      <span>{{ dataError }}</span>
      <el-button size="small" text @click="retryLoadData">重试</el-button>
    </div>

    <!-- 搜索框 -->
    <SearchBox />

    <!-- 左侧菜单 -->
    <left />

    <!-- 右侧图表面板 -->
    <Echarts ref="echartsRef" :district-data="data" @metric-change="switchDataType" />

    <!-- 底部信息面板 -->
    <BottomInfoPanel :selected-place="selectedPlace" />
    <div class="slider-block">
      <el-slider
        v-model="mapStore.layerOpacity"
        :min="0"
        :max="100"
        :step="10"
        vertical
        height="200px"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useMapStore } from '@/stores/map'
import 'ol/ol.css'
import { useDrawTools } from '@/hooks/useDrawTools'
import { useMap } from '@/hooks/useMap'
import '@/styles/map.css'
import left from '@/components/Layout/leftTools.vue'
import SearchBox from '@/components/Layout/SearchBox.vue'
import Echarts from '@/components/Layout/echartsChart.vue'
import BottomInfoPanel from '@/components/Layout/BottomInfoPanel.vue'
import { useData } from '@/hooks/useData'
import type { DataItem } from '@/hooks/useData'
import { Map } from 'ol'
import VectorLayer from 'ol/layer/Vector'
import { useMetro } from '@/hooks/useMetro'
import { useHeatMap } from '@/hooks/useHeatMap'

const { data, loading, error: dataError, loadChengduData, switchDataType } = useData()
const mapStore = useMapStore()
const { mapInstance, backgroundLayer, initMap } = useMap('data-view-map')
const { createMetroLayer, loadMetroData } = useMetro()
const { createHeatMapLayer } = useHeatMap()

let drawTools: ReturnType<typeof useDrawTools> | null = null
const selectedPlace = ref<DataItem | null>(null)
const echartsRef = ref()

// 初始化地图（不依赖区县数据也能显示底图）
async function bootstrapMap() {
  let geoJson: any = null

  try {
    geoJson = await loadChengduData()
  } catch (err) {
    console.error('加载区县数据失败:', err)
  }

  if (!geoJson) {
    ElMessage.warning('区县数据加载失败，地图将以无叠加层模式运行。可点击下方"重试"按钮重新加载。')
  }

  await initMap(geoJson, (name: string) => {
    const place = data.value.find((item) => item.name === name)
    selectedPlace.value = place || null
    echartsRef.value?.updateChart(name, data.value)
  })

  if (mapInstance.value) {
    drawTools = useDrawTools(mapInstance.value as Map)
    drawTools.addLayerToMap(mapInstance.value as Map)
    if (backgroundLayer.value) {
      drawTools.startSelect(backgroundLayer.value as VectorLayer)
    }
    mapStore.setDrawToolsInstance(drawTools)
  }
}

// 重试加载数据
async function retryLoadData() {
  if (loading.value) return
  const geoJson = await loadChengduData()

  if (geoJson && mapInstance.value) {
    // 重新创建区县矢量图层
    try {
      const GeoJSON = (await import('ol/format/GeoJSON')).default
      const VectorSource = (await import('ol/source/Vector')).default
      const { styleFunction } = await import('@/utils/styles')

      const source = new VectorSource({
        features: new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }).readFeatures(geoJson),
      })
      const vectorLayer = new VectorLayer({
        source,
        style: styleFunction,
        zIndex: 100,
        properties: { title: '成都区县', type: 'overlay' },
      })
      vectorLayer.set('name', 'district-layer')

      mapInstance.value.addLayer(vectorLayer)
      backgroundLayer.value = vectorLayer as unknown as VectorLayer

      ElMessage.success('区县数据已重新加载')
    } catch (err) {
      console.error('重建区县图层失败:', err)
      ElMessage.error('区县数据解析失败')
    }
  }
}

async function addmetroLayer() {
  try {
    await loadMetroData()
    const metroLayer = createMetroLayer()
    mapInstance.value?.addLayer(metroLayer)
  } catch (err) {
    console.error('加载地铁图层失败:', err)
    ElMessage.warning('地铁数据加载失败，已跳过地铁叠加图层')
  }
}

const addHeatMap = async () => {
  try {
    const layer = await createHeatMapLayer()
    if (layer) {
      mapInstance.value?.addLayer(layer)
    }
  } catch (err) {
    console.error('加载热力图层失败:', err)
  }
}

onMounted(async () => {
  await bootstrapMap()
  await Promise.all([addmetroLayer(), addHeatMap()])
  console.log('地图图层数量:', mapInstance.value?.getLayers().getArray().length)
})

// 监听透明度变化
watch(
  () => mapStore.layerOpacity,
  (opacity) => {
    if (backgroundLayer.value) {
      backgroundLayer.value.setOpacity(opacity / 100)
    }
  },
)
</script>

<style scoped>
.map-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f0f0f0;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

#data-view-map {
  width: 100%;
  height: 100%;
}

.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  gap: 16px;
  font-size: 16px;
  color: #333;
}

.map-loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.map-error-banner {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff3cd;
  color: #856404;
  padding: 10px 24px;
  border-radius: 6px;
  z-index: 1500;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
}

.slider-block {
  max-width: 600px;
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 120px;
  right: 20px;
  z-index: 1000;
  background: transparent;
  padding: 10px;
}
</style>

<style>
@import '@/styles/map.css';
@import '@/styles/layerswitcher.css';
</style>
