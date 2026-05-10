<template>
  <div>
    <div class="chart-mini-box" @click="toggleExpanded">
      <span>{{ expanded ? '隐藏图表' : '显示图表' }}</span>
    </div>

    <transition name="fade">
      <div v-show="expanded" class="right-chart-panel">
        <div class="metric-switcher">
          <el-segmented v-model="index" :options="metricOptions" @change="handleMetricChange" />
        </div>
        <div class="chart-container" ref="chartEl"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useEcharts } from '@/hooks/useECharts'
import type { DataItem } from '@/hooks/useData'

interface Props {
  districtData?: DataItem[]
}
const expanded = ref(false)
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const props = withDefaults(defineProps<Props>(), {
  districtData: () => [],
})

const emit = defineEmits<{
  metricChange: [type: 'area' | 'population' | 'gdp']
}>()

const chartEl = ref<HTMLElement | null>(null)
const index = ref<'area' | 'population' | 'gdp'>('area')

const metricOptions = [
  { label: '面积', value: 'area' },
  { label: '人口', value: 'population' },
  { label: 'GDP', value: 'gdp' },
]

const { initChart, updateChart, resetChart } = useEcharts()

let initialized = false
watch(
  () => props.districtData,
  async (newData) => {
    if (!newData.length) return

    if (!initialized) {
      await nextTick()
      if (!chartEl.value) return

      const width = chartEl.value.clientWidth
      const height = chartEl.value.clientHeight
      if (!width || !height) return

      initChart(chartEl.value, newData, index.value)
      initialized = true
    } else {
      resetChart(newData, index.value)
    }
  },
  { deep: true, immediate: true },
)

// 监听指标变化，重新渲染图表
watch(index, (newType) => {
  if (!initialized) return
  resetChart(props.districtData, newType)
})

// 处理指标切换
const handleMetricChange = (type: 'area' | 'population' | 'gdp') => {
  index.value = type
  emit('metricChange', type)
}

// 暴露给父组件的方法，用于点击地图时更新图表
defineExpose({
  updateChart: (name: string) => updateChart(name, props.districtData),
})
</script>

<style scoped>
.chart-mini-box {
  position: fixed;
  right: 16px;
  top: 80px;
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 910;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}
.right-chart-panel {
  position: fixed;
  right: 16px;
  top: 80px;
  width: 380px;
  height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 900;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 200px);
}

.metric-switcher {
  display: flex;
  justify-content: center;
}

.chart-container {
  width: 100%;
  min-height: 300px;
  flex: 1;
}

@media (max-width: 1200px) {
  .right-chart-panel {
    position: fixed;
    right: 16px;
    top: 80px;
    width: 380px;
    height: calc(100vh - 200px);
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 900;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 200px);
  }
}
</style>
