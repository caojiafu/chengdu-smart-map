import { onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import type { DataItem } from '@/hooks/useData'
export function useEcharts() {
  const chartRef = ref<HTMLElement | null>(null)
  let myChart: echarts.ECharts | null = null
  type type = 'area' | 'population' | 'gdp'

  const titleMap = {
    area: '成都市各区县面积统计(km²)',
    population: '成都市各区县常住人口统计(万人)',
    gdp: '成都市各区县GDP统计(亿元)',
  }

  //初始化图表
  const initChart = (el: HTMLElement, data: DataItem[], type: type) => {
    chartRef.value = el
    myChart = echarts.init(el)
    // 初始化时就渲染一次完整的图表，避免空 option
    renderChart(data, type)
  }
  //渲染图表
  const renderChart = (data: DataItem[], type: type) => {
    if (!myChart) return
    myChart.setOption({
      title: { text: titleMap[type] },
      tooltip: { trigger: 'axis' },
      xAxis: {
        data: data.map((i) => i.name), // X轴：区县名称
        axisLabel: { rotate: 30 }, // 旋转避免拥挤
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: data.map((i) => i.value), // Y轴：数值
          itemStyle: { color: '#1677ff' },
        },
      ],
    })
  }
  //点击区县联动
  const updateChart = (name: string, allData: DataItem[]) => {
    const item = allData.find((i) => i.name === name)
    if (!item || !myChart) return
    myChart.setOption({
      xAxis: { data: [name] }, // 只显示一个区县
      series: [{ type: 'bar', data: [item.value] }], //只显示一个数值
    })
  }
  //重置图表
  const resetChart = (allData: DataItem[], type: type) => {
    renderChart(allData, type)
  }
  onUnmounted(() => {
    if (myChart) {
      myChart.dispose()
    }
  })

  return {
    initChart,
    updateChart,
    resetChart,
  }
}
