/**
 * Canvas 性能优化：为所有 2D 上下文自动启用 willReadFrequently。
 * OpenLayers 频繁调用 getImageData/readPixels，该标志提示浏览器
 * 将 Canvas 后端切换为软件渲染，避免 GPU 回读带来的性能损失。
 */
try {
  const originalGetContext = HTMLCanvasElement.prototype.getContext as (
    this: HTMLCanvasElement,
    contextId: string,
    options?: any,
  ) => RenderingContext | null

  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    options?: any,
  ): RenderingContext | null {
    if (contextId === '2d') {
      return originalGetContext.call(this, contextId, {
        ...options,
        willReadFrequently: true,
      })
    }
    return originalGetContext.call(this, contextId, options)
  }
} catch (err) {
  console.warn('Canvas 优化 patch 失败，将使用原生 getContext:', err)
}
