// @see https://developer.mozilla.org/ja/docs/Web/HTML/Element/img
const imageExtensions = [
  // APNG
  'apng',
  // AVIF
  'avif',
  // GIF
  'gif',
  // JPEG
  'jpg',
  'jpeg',
  'jfif',
  'pjpeg',
  'pjp',
  // PNG
  'png',
  // SVG
  'svg',
  // WebP
  'webp',
  // BMP
  'bmp',
  // ICO
  'ico',
  'cur',
  // TIFF
  // 'tif',
  // 'tiff',
]

const videoExtensions = [
  // AVI
  'avi',
  // MOV
  'mov',
  // MP4
  'mp4',
  // WMV
  'wmv',
  // FLV
  'flv',
  // WebM
  'webm',
]

export const isImageFile = (path: string) => {
  const extension = (path.match(/\.([^.]+)$/)?.[1] ?? '').toLocaleLowerCase()
  return imageExtensions.includes(extension)
}

export const isVideoFile = (path: string) => {
  const extension = (path.match(/\.([^.]+)$/)?.[1] ?? '').toLocaleLowerCase()
  return videoExtensions.includes(extension)
}
