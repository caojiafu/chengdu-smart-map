import { Fill, Stroke, Style, Text, Circle } from 'ol/style'
import type { FeatureLike } from 'ol/Feature'
export const getColor = (adcode: string) => {
  const code = String(adcode)
  // 成都各区县颜色映射字典
  const colorMap: Record<string, string> = {
    // 五城区
    '510104': '63, 81, 181', // 锦江 - 深蓝色
    '510105': '92, 107, 192', // 青羊 - 蓝紫色
    '510106': '121, 134, 203', // 金牛 - 浅蓝紫色
    '510107': '159, 168, 218', // 武侯 - 淡蓝紫色
    '510108': '144, 164, 174', // 成华 - 灰蓝色

    // 近郊发展区 (采用绿色系，体现生态和发展活力)
    '510112': '76, 175, 80', // 龙泉驿 - 鲜绿色
    '510113': '102, 187, 106', // 青白江 - 明绿色
    '510114': '129, 199, 132', // 新都 - 柔和绿色
    '510115': '156, 212, 159', // 温江 - 淡绿色
    '510116': '0, 150, 136', // 双流 - 青绿色
    '510117': '41, 182, 246', // 郫都 - 天蓝色 (临近高新，用蓝色系)
    '510118': '79, 195, 247', // 新津 - 浅天蓝色

    // 远郊生态区 (采用橙黄色系和大地色系，体现自然生态)
    '510121': '255, 152, 0', // 金堂 - 橙色
    '510129': '255, 179, 0', // 大邑 - 橙黄色
    '510131': '255, 202, 40', // 蒲江 - 金色
    '510181': '244, 67, 54', // 都江堰 - 珊瑚红 (旅游城市特色)
    '510182': '233, 30, 99', // 彭州 - 玫瑰红
    '510183': '156, 39, 176', // 邛崃 - 紫色
    '510184': '103, 58, 183', // 崇州 - 深紫色
    '510185': '33, 150, 243', // 简阳 - 蓝色 (临空经济区)
  }
  // 如果匹配到则返回对应色，否则返回默认灰色
  const rgb = colorMap[code] || '200, 200, 200'
  return `rgba(${rgb})`
}
export const styleFunction = (feature: FeatureLike) => {
  const adcode = feature.get('adcode')

  return new Style({
    fill: new Fill({
      color: getColor(adcode),
    }),
    stroke: new Stroke({
      color: '#ffffff',
      width: 2,
    }),
    text: new Text({
      text: feature.get('name'),
      font: '14px Microsoft YaHei',
      fill: new Fill({
        color: '#000000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
}

export const highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(50, 205, 50, 0.3)',
  }),
  stroke: new Stroke({
    color: 'rgb(0, 255, 0)',
    width: 5,
    lineDash: [10, 5],
  }),
})

// 定义样式函数，根据Feature的几何类型设置不同样式
export const metroStyleFunction = (feature: FeatureLike) => {
  const geometryType = feature.getGeometry()?.getType()

  if (geometryType === 'Point') {
    // 站点样式：红色圆形，白色边框
    return new Style({
      image: new Circle({
        radius: 6, // 圆形半径
        fill: new Fill({
          color: '#e60012', // 红色填充（地铁主题）
        }),
        stroke: new Stroke({
          color: '#ffffff', // 白色边框
          width: 2,
        }),
      }),
      text: new Text({
        text: feature.get('name'), // 站点名称
        font: '12px Arial',
        fill: new Fill({
          color: '#ffffff', // 白色文本
        }),
        stroke: new Stroke({
          color: '#000000', // 黑色边框
          width: 1,
        }),
        offsetX: -5, // 文本偏移量
      }),
    })
  } else if (geometryType === 'LineString') {
    // 线路样式：红色线条
    return new Style({
      stroke: new Stroke({
        color: '#e60012', // 红色线条
        width: 3,
      }),
      text: new Text({
        text: feature.get('name'), // 线路名称
        font: '12px Arial',
        fill: new Fill({
          color: '#ffffff', // 白色文本
        }),
        stroke: new Stroke({
          color: '#000000', // 黑色边框
          width: 1,
        }),
        offsetX: -5, // 文本偏移量
      }),
    })
  }

  // 默认样式（如果有其他类型）
  return new Style({
    stroke: new Stroke({
      color: '#cccccc',
      width: 1,
    }),
  })
}
