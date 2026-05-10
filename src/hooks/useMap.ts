import { ref, shallowRef, onUnmounted } from 'vue'
import XYZ from 'ol/source/XYZ'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import type BaseLayer from 'ol/layer/Base'
import { fromLonLat } from 'ol/proj'
import { transformExtent } from 'ol/proj'
import ScaleLine from 'ol/control/ScaleLine'
import MousePosition from 'ol/control/MousePosition'
import { styleFunction } from '@/utils/styles'
import LayerSwitcher from 'ol-layerswitcher'
import { useMapStore } from '@/stores/map'

export function useMap(target: string) {
  const mapInstance = shallowRef<Map | null>(null)
  const backgroundLayer = shallowRef<VectorLayer | null>(null)
  const vectorSource = shallowRef<VectorSource | null>(null)
  // 创建所有底图图层
  const baseLayers = {
    amap: new TileLayer({
      source: new XYZ({
        url: 'https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
      }),
      visible: true,
      zIndex: 1,
      properties: {
        title: '高德地图',
        type: 'base',
        group: '底图',
      },
    }),
    satellite: new TileLayer({
      source: new XYZ({
        url: 'https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}',
      }),
      visible: false,
      zIndex: 1,
      properties: {
        title: '高德卫星',
        type: 'base',
        group: '底图',
      },
    }),
    'tianditu-vector': new TileLayer({
      source: new XYZ({
        url: 'http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b26223e77e33214399aadac8211e850f',
      }),
      visible: false,
      zIndex: 1,
      properties: {
        title: '天地图矢量',
        type: 'base',
        group: '底图',
      },
    }),
    'tianditu-satellite': new TileLayer({
      source: new XYZ({
        url: 'http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b26223e77e33214399aadac8211e850f',
      }),
      visible: false,
      zIndex: 1,
      properties: {
        title: '天地图影像',
        type: 'base',
        group: '底图',
      },
    }),
  }
  const layerSwitcher = new LayerSwitcher({
    tipLabel: '图层',
    groupSelectStyle: 'children',
    collapseLabel: '›',
    label: '‹',
  })
  const chengduExtent = transformExtent([102.9, 30.0, 105.0, 31.5], 'EPSG:4326', 'EPSG:3857')

  const initMap = async (geoJson: any, onClickMap: (name: string) => void) => {
    const layers: BaseLayer[] = [...Object.values(baseLayers)]

    // 仅在数据加载成功时创建区县图层
    if (geoJson) {
      try {
        const features = new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }).readFeatures(geoJson)

        if (features.length > 0) {
          const source = new VectorSource({ features })
          const vectorLayer = new VectorLayer({
            source,
            style: styleFunction,
            zIndex: 100,
            properties: {
              title: '成都区县',
              type: 'overlay',
            },
          })
          vectorLayer.set('name', 'district-layer')
          vectorSource.value = source
          backgroundLayer.value = vectorLayer
          layers.push(vectorLayer)
        }
      } catch (err) {
        console.error('解析 GeoJSON 数据失败:', err)
        // 地图仍然可以正常显示底图
      }
    }

    mapInstance.value = new Map({
      target,
      layers,
      view: new View({
        center: fromLonLat([104.06, 30.67]),
        zoom: 8,
        minZoom: 8,
        maxZoom: 18,
        extent: chengduExtent,
        constrainOnlyCenter: false, //允许地图超出范围但限制中心点在范围内
        smoothExtentConstraint: true, //启用平滑的范围约束，避免在边界处出现突然停止的感觉
      }),
      controls: [
        new ScaleLine({
          units: 'metric',
          text: true,
          minWidth: 140,
          className: 'ol-scale-line',
        }),
        new MousePosition({
          projection: 'EPSG:4326',
          coordinateFormat: function (coordinate) {
            if (!coordinate) return ''
            const [lon = 0, lat = 0] = coordinate
            return `经度: ${lon.toFixed(4)}, 纬度: ${lat.toFixed(4)}`
          },
          className: 'ol-mouse-position-bottom-right',
        }),
        layerSwitcher, //图层控件
      ],
    })
    //全局管理地图实例对象
    const mapStore = useMapStore()
    mapStore.setMapInstance(mapInstance.value)

    mapInstance.value.on('click', (e) => {
      // console.log('地图点击了')

      if (mapStore.drawToolsInstance?.isDrawing) return //如果正在绘制，不响应地图点击事件
      mapInstance.value?.forEachFeatureAtPixel(e.pixel, (feature) => {
        const name = feature.get('name')
        onClickMap(name)
      })
    })
    console.log('地图初始化完成')
  }

  // // 切换底图函数
  // const switchBaseMap = (type: string) => {
  //   Object.keys(baseLayers).forEach((key) => {
  //     const layer = baseLayers[key as keyof typeof baseLayers]
  //     layer.setVisible(key === type)
  //   })
  // }

  onUnmounted(() => {
    if (mapInstance.value) {
      mapInstance.value.dispose()
      mapInstance.value = null
    }
  })
  return {
    mapInstance,
    backgroundLayer,
    vectorSource,
    initMap,
  }
}
