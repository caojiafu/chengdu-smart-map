import { ref } from 'vue'
import axios from 'axios'

const CHENGDU_DATA = {
  锦江区: { area: 61.62, population: 90.29, gdp: 1370.1 },
  青羊区: { area: 66.85, population: 95.91, gdp: 1470.5 },
  金牛区: { area: 108.32, population: 156.65, gdp: 1460.2 },
  武侯区: { area: 74.98, population: 120.64, gdp: 1360.7 },
  成华区: { area: 109.87, population: 138.17, gdp: 1100.3 },
  龙泉驿区: { area: 557.99, population: 134.6, gdp: 1670.8 },
  青白江区: { area: 378.94, population: 50.61, gdp: 760.2 },
  新都区: { area: 497.0, population: 156.0, gdp: 1050.5 },
  温江区: { area: 276.14, population: 96.7, gdp: 740.3 },
  双流区: { area: 1065.0, population: 272.3, gdp: 1850.1 },
  郫都区: { area: 438.0, population: 167.2, gdp: 750.6 },
  新津区: { area: 330.94, population: 37.2, gdp: 450.2 },
  简阳市: { area: 2213.5, population: 113.6, gdp: 680.5 },
  都江堰市: { area: 1208.0, population: 70.9, gdp: 500.1 },
  彭州市: { area: 1421.4, population: 73.1, gdp: 620.3 },
  邛崃市: { area: 1377.0, population: 60.5, gdp: 410.2 },
  崇州市: { area: 1089.0, population: 72.3, gdp: 520.6 },
  金堂县: { area: 1156.0, population: 81.0, gdp: 600.5 },
  大邑县: { area: 1284.0, population: 50.4, gdp: 350.1 },
  蒲江县: { area: 580.14, population: 25.6, gdp: 220.3 },
}

export interface DataItem {
  name: string
  value: number
  area: number
  population: number
  gdp: number
}
interface ChengduFeature {
  type: 'Feature'
  properties: {
    name: string
    // 可以添加其他已知属性
  }
  geometry: any
}
export const useData = () => {
  const data = ref<DataItem[]>([]) //区县数据列表
  const loading = ref(false) //数据加载状态
  const error = ref<string | null>(null) //错误信息

  const loadChengduData = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await axios.get(
        'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=510100_full',
      )

      data.value = res.data.features.map((item: ChengduFeature) => {
        const name = item.properties.name
        const real = CHENGDU_DATA[name as keyof typeof CHENGDU_DATA] || {
          area: 0,
          population: 0,
          gdp: 0,
        }
        return {
          name,
          area: real.area,
          population: real.population,
          gdp: real.gdp,
          value: real.area, //默认显示面积
        }
      })
      return res.data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '数据加载失败，请检查网络连接'
      error.value = message
      console.error('加载成都区县数据失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  //切换显示指标
  const switchDataType = (type: 'area' | 'population' | 'gdp') => {
    data.value.forEach((item) => {
      item.value = item[type]
    })
  }

  return {
    data,
    loading,
    error,
    loadChengduData,
    switchDataType,
  }
}
