import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import Map from 'ol/Map'
import type { UseDrawToolsReturn } from '@/hooks/useDrawTools'

export const useMapStore = defineStore('map', () => {
  //地图实例
  const mapInstance = ref<Map | null>(null)
  //绘制工具实例
  const drawToolsInstance = ref<UseDrawToolsReturn | null>(null)

  //透明度
  const layerOpacity = ref<number>(100)

  function setMapInstance(map: Map | null) {
    mapInstance.value = map
  }

  function setDrawToolsInstance(instance: UseDrawToolsReturn | null) {
    drawToolsInstance.value = instance
  }
  function setOpacity(opacity: number) {
    layerOpacity.value = opacity
  }

  return {
    mapInstance,
    setMapInstance,
    drawToolsInstance,
    setDrawToolsInstance,
    layerOpacity,
    setOpacity,
  }
})
