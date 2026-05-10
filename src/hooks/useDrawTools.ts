import { ref } from 'vue'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Draw from 'ol/interaction/Draw'
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style'
import { getLength, getArea } from 'ol/sphere'
import Select from 'ol/interaction/Select'
import { pointerMove } from 'ol/events/condition'
import Map from 'ol/Map'
import type { Geometry } from 'ol/geom'
import Polygon from 'ol/geom/Polygon'
import LineString from 'ol/geom/LineString'
import type Feature from 'ol/Feature'
import { unByKey } from 'ol/Observable'
import { useBuffer } from './useBuffer'
//绘制类型
export type DrawType = 'Point' | 'LineString' | 'Polygon' | 'Circle'

export function useDrawTools(map: Map | null) {
  //当前的绘制类型
  const currentDrawType = ref<DrawType | null>(null)
  //当前选中的要素
  const selectFeature = ref<Feature<Geometry> | null>(null)
  //专门存放用户绘制的点、线、面和测量结果
  const drawSource = new VectorSource()
  //当前的绘制交互实例
  let drawInteraction: Draw | null = null
  //当前的选择交互实例
  let selectInteraction: Select | null = null
  //绘制状态
  const isDrawing = ref(false)

  const defaultStyle = new Style({
    fill: new Fill({ color: 'rgba(74, 144, 226, 0.15)' }),
    stroke: new Stroke({ color: '#4a90e2', width: 3 }),
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: '#007bff' }),
      stroke: new Stroke({ color: '#fff', width: 2 }),
    }),
  })
  const selectedStyle = new Style({
    fill: new Fill({ color: 'rgba(255, 0, 0, 0.3)' }),
    stroke: new Stroke({ color: 'red', width: 3 }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: '#fff' }),
      stroke: new Stroke({ color: '#4a90e2', width: 2 }),
    }),
  })
  const measurementStyle = (text: string) =>
    new Style({
      stroke: new Stroke({
        color: '#00d2ff',
        width: 2,
        lineDash: [12, 6],
      }),
      text: new Text({
        text,
        font: 'bold 14px Arial',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.5)', width: 3 }), // 给文字加半透明黑边，防止在复杂底图上看不清
        offsetY: -10,
      }),
    })

  //创建矢量图层
  const vectorLayer = new VectorLayer({
    source: drawSource,
    style: defaultStyle,
    zIndex: 1000, //确保图层在最上层
  })

  function addLayerToMap(mapInstance: Map) {
    //将图层添加到地图上
    mapInstance.addLayer(vectorLayer)
  }

  function createDrawInteraction(type: DrawType) {
    //创建绘制交互
    if (!map) return
    stopAllInteractions()
    currentDrawType.value = type
    drawInteraction = new Draw({
      source: drawSource,
      type,
      stopClick: true, //阻止点击事件传播
    })
    map.addInteraction(drawInteraction) //将绘制交互添加到地图上
  }
  function startDraw(type: DrawType) {
    if (!map) return
    stopDraw()
    isDrawing.value = true
    createDrawInteraction(type)
    // drawInteraction?.once('drawend', () => {
    //   stopDraw()
    // })
  }
  function stopDraw() {
    if (drawInteraction && map) {
      map.removeInteraction(drawInteraction)
      drawInteraction = null
    }
    currentDrawType.value = null
    isDrawing.value = false
  }

  function clearDrawings() {
    drawSource.clear() //只清除绘制源中的要素，不影响其他图层或背景数据
    // 清除 Select 交互中的选中要素集合
    if (selectInteraction) {
      selectInteraction.getFeatures().clear()
    }
    // 清空选中状态的引用
    selectFeature.value = null
    // 触发图层更新（通常 clear 会自动触发，但显式调用更安全）
    vectorLayer.changed()
  }

  function getFeatures() {
    return drawSource.getFeatures() //获取所有要素
  }

  function startMeasureLength() {
    createDrawInteraction('LineString')

    drawInteraction?.on('drawstart', (e) => {
      const lineFeature = e.feature //获取绘制完成的线要素
      const geometry = lineFeature.getGeometry() //获取线要素的几何对象

      if (!geometry) return

      //实时显示长度
      const geomChangeListen = geometry.on('change', () => {
        const length = getLength(geometry as Geometry) //获取线段长度(米)
        const formatLength =
          length > 1000 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(2)} m`

        lineFeature.setStyle(measurementStyle(formatLength))
      })
      // 绘制结束时清理监听器
      drawInteraction?.once('drawend', () => {
        if (geomChangeListen) {
          unByKey(geomChangeListen)
        }
        // useBuffer(geometry, vectorLayer)
      })
    })
  }
  function startMeasureArea() {
    createDrawInteraction('Polygon')
    drawInteraction?.on('drawstart', (e) => {
      const polygonFeature = e.feature
      const geometry = polygonFeature.getGeometry()

      if (!geometry) return
      //实时显示面积
      const geomChangeListen = geometry.on('change', () => {
        const area = getArea(geometry as Geometry)
        const formatArea =
          area > 10000 ? `${(area / 1000000).toFixed(2)} km²` : `${area.toFixed(2)} m²`
        polygonFeature.setStyle(measurementStyle(formatArea))
      })
      drawInteraction?.once('drawend', () => {
        if (geomChangeListen) {
          unByKey(geomChangeListen)
        }
      })
    })
  }
  function stopSelect() {
    if (selectInteraction && map) {
      map.removeInteraction(selectInteraction)
      selectInteraction = null
    }
    selectFeature.value = null
    isDrawing.value = false
    // vectorLayer.changed()
  }
  // 缓冲区分析专用图层，与绘制图层分离
  const bufferSource = new VectorSource()
  const bufferLayer = new VectorLayer({
    source: bufferSource,
    zIndex: 999,
  })
  let bufferLayerAdded = false

  /** 确保缓冲区图层已添加到地图 */
  function ensureBufferLayerOnMap() {
    if (!bufferLayerAdded && map) {
      map.addLayer(bufferLayer)
      bufferLayerAdded = true
    }
  }

  /** 对 drawSource 中最后一个面或线执行缓冲区分析，返回是否成功 */
  function runBufferAnalysis(radius = 1000): boolean {
    if (!map) {
      console.warn('地图未初始化')
      return false
    }
    const features = drawSource.getFeatures()
    if (features.length === 0) {
      console.warn('请先绘制一个面或线')
      return false
    }
    const lastFeature = features[features.length - 1]!
    const geometry = lastFeature.getGeometry() as Geometry | undefined
    if (!geometry) return false

    if (!(geometry instanceof Polygon) && !(geometry instanceof LineString)) {
      console.warn('缓冲区分析仅支持面(Polygon)或线(LineString)')
      return false
    }

    try {
      ensureBufferLayerOnMap()
      useBuffer(geometry, bufferLayer, radius)
      return true
    } catch (err) {
      console.error('缓冲区分析失败:', err)
      return false
    }
  }

  /** 清除所有缓冲区 */
  function clearBuffer() {
    bufferSource.clear()
  }

  function stopAllInteractions() {
    stopDraw()
    stopSelect()
    // 以后再加 modify/translate 时也一起清理
  }
  function startSelect(layer: VectorLayer) {
    if (!map) return
    stopAllInteractions()
    selectInteraction = new Select({
      layers: [layer],
      condition: pointerMove,
      style: selectedStyle,
    })
    selectInteraction.on('select', (e) => {
      selectFeature.value = e.selected[0] ?? null
      // console.log(e.selected)
    })
    map.addInteraction(selectInteraction)
  }
  return {
    currentDrawType,
    selectFeature,
    selectInteraction,
    vectorLayer,
    startDraw,
    stopDraw,
    clearDrawings,
    getFeatures,
    addLayerToMap,
    startMeasureLength,
    startMeasureArea,
    startSelect,
    stopSelect,
    stopAllInteractions,
    isDrawing,
    runBufferAnalysis,
    clearBuffer,
  }
}

export type UseDrawToolsReturn = ReturnType<typeof useDrawTools> //绘制工具返回类型
