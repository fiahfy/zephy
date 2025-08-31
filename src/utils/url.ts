type UrlParams =
  | { type: 'file'; path: string | undefined }
  | { type: 'ratings'; score: number }
  | { type: 'settings' }

export const buildUrl = (params: UrlParams) => {
  switch (params.type) {
    case 'file':
      return params.path
        ? window.electronAPI.pathToFileURL(params.path)
        : undefined
    case 'ratings':
      return `zephy://ratings/${params.score}`
    case 'settings':
      return 'zephy://settings'
  }
}

export const parseUrl = (url: string): UrlParams | undefined => {
  try {
    const u = new URL(url)
    switch (u.protocol) {
      case 'file:':
        return { type: 'file', path: window.electronAPI.fileURLToPath(url) }
      case 'zephy:':
        switch (u.host) {
          case 'ratings': {
            const score = Number(u.pathname.split('/')[1] ?? '')
            return { type: 'ratings', score }
          }
          case 'settings':
            return { type: 'settings' }
          default:
            return undefined
        }
      default:
        return undefined
    }
  } catch {
    return undefined
  }
}

export const isFileUrl = (url: string) => parseUrl(url)?.type === 'file'

export const getTitle = (url: string) => {
  const params = parseUrl(url)
  switch (params?.type) {
    case 'file': {
      const sep = window.electronAPI.sep
      const names = params.path?.split(sep) ?? []
      return names[names.length - 1] ?? params.path ?? ''
    }
    case 'ratings':
      return `Ratings (${params.score})`
    case 'settings':
      return 'Settings'
    default:
      return 'Error'
  }
}

export const getIconType = (url: string) => {
  const params = parseUrl(url)
  switch (params?.type) {
    case 'file':
      return 'folder'
    case 'ratings':
      return 'star'
    case 'settings':
      return 'settings'
    default:
      return 'error-outline'
  }
}
