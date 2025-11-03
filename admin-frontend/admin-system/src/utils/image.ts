/**
 * 获取完整的图片 URL
 * 如果传入的路径已经是完整的 URL（http/https），直接返回
 * 如果是以 / 开头，则认为是相对路径，可能需要添加服务器基础 URL
 * @param imagePath 图片路径（可以是相对路径或完整 URL）
 * @returns 完整的图片 URL
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '/images/default_image.jpg'
  }
  
  // 如果已经是完整的 URL（http/https），直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // 如果以 / 开头，则直接使用（假设服务器会处理这些路径）
  if (imagePath.startsWith('/')) {
    return imagePath
  }
  
  // 否则，添加 / 前缀
  return `/${imagePath}`
}

