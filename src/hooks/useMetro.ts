import axios from 'axios'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { metroStyleFunction } from '@/utils/styles'

let metroSource: VectorSource | null = null

export function useMetro() {
  const loadMetroData = async () => {
    const response = await fetch('/data/成都地铁.geojson')
    const geojsonData = await response.json()

    const features = new GeoJSON().readFeatures(geojsonData, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })

    metroSource = new VectorSource({
      features,
    })
  }

  const createMetroLayer = () => {
    if (!metroSource) {
      throw new Error('地铁数据尚未加载，请先调用 loadMetroData()')
    }

    return new VectorLayer({
      source: metroSource,
      style: metroStyleFunction,
      zIndex: 200,
      properties: {
        title: '成都地铁',
        type: 'overlay',
      },
    })
  }

  return { loadMetroData, createMetroLayer }
}
