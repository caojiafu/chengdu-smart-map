import { unref, type Ref } from 'vue'
import VectorLayer from 'ol/layer/Vector'
import type { Feature } from 'ol'
import { styleFunction, highlightStyle } from '@/utils/styles'
import type Map from 'ol/Map'
import { ElMessage } from 'element-plus'

/**
 * 接收 Ref<Map | null>、Map | null 或 Map 类型的地图实例
 * 内部通过 unref 统一解包
 */
export function useSearchTools(mapRef: Ref<Map | null> | Map | null) {
  //上一次查询选中的要素
  let lastSelectedFeature: Feature | null = null
  //获取地图实例的统一方法
  const getMap = (): Map | null => unref(mapRef as Ref<Map | null> | Map | null)
  const handleSearch = (keyword: string) => {
    const normalizedKeyword = keyword.replace(/[区县市]$/, '') //去除用户输入中可能包含的”区”、”县”、”市”后缀
    if (!keyword) {
      ElMessage.warning('请输入区县名称')
      return
    }
    const map = getMap()
    if (!map) {
      ElMessage.error('地图尚未初始化，请稍后再试')
      return
    }
    // 获取图层并校验
    const layers = map.getLayers().getArray()
    const layer = layers?.find((layer) => layer.get('name') === 'district-layer')

    if (!(layer instanceof VectorLayer)) {
      ElMessage.warning('区县数据图层未加载，无法搜索')
      return
    }

    // 获取数据源并校验
    const source = layer.getSource()
    if (!source) {
      ElMessage.error('图层数据源异常')
      return
    }
    //查找要素
    const feature = source.getFeatures().find((f: Feature) => {
      return f.get('name').includes(normalizedKeyword)
    })
    if (lastSelectedFeature) {
      lastSelectedFeature.setStyle(undefined)
    }

    if (feature) {
      console.log(feature)

      lastSelectedFeature = feature
      //样式实例对象
      const styleObj = styleFunction(feature)
      const view = map.getView()
      if (view) {
        view.fit(feature.getGeometry().getExtent(), { padding: [50, 50, 50, 50], duration: 1000 })
      }

      feature.setStyle([styleObj, highlightStyle])
    } else {
      ElMessage.warning(`未找到”${keyword}”相关的区县`)
    }
  }
  return {
    handleSearch,
  }
}
