import GeoJSON from 'ol/format/GeoJSON'
import * as turf from '@turf/turf'
import Geometry from 'ol/geom/Geometry'
import VectorLayer from 'ol/layer/Vector'
import { Feature } from 'ol'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
export function useBuffer(geom: Geometry, bufferLayer: VectorLayer, radius: number = 1000) {
  const format = new GeoJSON()
  //将 OpenLayers 的 Geometry 转换为 GeoJSON 格式，以便 Turf.js 进行缓冲分析
  const geojson = format.writeGeometryObject(geom, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  })
  //Turf buffer 需要具体的几何类型，不能是 GeometryCollection 或 undefined
  if (!geojson || geojson.type === 'GeometryCollection') return

  //Turf buffer
  const buffered = turf.buffer(geojson, radius, { units: 'meters' })

  const bufferGeom = format.readGeometry(buffered?.geometry, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  })
  const bufferFeature = new Feature(bufferGeom)

  const bufferStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.2)',
    }),
    stroke: new Stroke({
      color: '#ff0000',
      width: 2,
    }),
  })
  bufferFeature.setStyle(bufferStyle)
  bufferLayer.getSource()?.addFeature(bufferFeature)
}
