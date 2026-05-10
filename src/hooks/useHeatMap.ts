import { Heatmap } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'

let heatMapLayer: Heatmap | null = null
export function useHeatMap() {
  const loadHeatMapData = async () => {
    try {
      const response = await fetch('/data/成都地铁.geojson')
      const geojsonData = await response.json()

      const features = new GeoJSON().readFeatures(geojsonData, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })

      //过滤出站点
      const stationFeatures = features.filter((feature: Feature) => {
        const properties = feature.getProperties()
        return properties.type === 'subway_station' && feature.getGeometry()?.getType() === 'Point'
      })

      // 为每个站点添加权重属性（模拟随机权重，范围0.1-1.0）
      stationFeatures.forEach((feature: Feature) => {
        // 如果GeoJSON中已有weight字段，使用它；否则模拟
        const weight = feature.get('weight')
        feature.set('weight', weight)
      })
      // 创建VectorSource
      const vectorSource = new VectorSource({
        features: stationFeatures,
      })

      // 创建Heatmap Layer
      heatMapLayer = new Heatmap({
        source: vectorSource,
        blur: 15, // 模糊半径
        radius: 8, // 点半径
        gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'], // 颜色渐变
        weight: (feature) => feature.get('weight') || 1, // 使用权重函数
        zIndex: 999,
        properties: {
          type: 'heatmap',
          title: '热力图',
        },
      })
      return heatMapLayer
    } catch (error) {
      console.error('加载热力图数据失败:', error)
      return null
    }
  }
  const createHeatMapLayer = async () => {
    if (!heatMapLayer) {
      await loadHeatMapData()
    }
    return heatMapLayer
  }
  const updateHeatMapWeights = (newWeights: number[]) => {
    // 更新权重（根据新数据调整）
    if (heatMapLayer) {
      const source = heatMapLayer.getSource() as VectorSource
      const features = source.getFeatures()
      features.forEach((feature, index) => {
        feature.set('weight', newWeights[index] || feature.get('weight'))
      })
      source.changed() // 触发重渲染
    }
  }
  return { createHeatMapLayer, updateHeatMapWeights }
}
