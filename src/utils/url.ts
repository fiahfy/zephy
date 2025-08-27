type ZephyUrlParams =
  | { pathname: 'ratings'; params: { score: number } }
  | { pathname: 'settings' }

export const buildZephyUrl = (inputs: ZephyUrlParams) => {
  switch (inputs.pathname) {
    case 'ratings':
      return `zephy://ratings/${inputs.params.score}`
    case 'settings':
      return 'zephy://settings'
  }
}

export const parseZephyUrl = (url: string): ZephyUrlParams | undefined => {
  if (!url.startsWith('zephy://')) {
    return undefined
  }
  const u = new URL(url)
  const host = u.host
  switch (host) {
    case 'ratings': {
      const score = Number(u.pathname.split('/')[1] ?? '')
      return {
        pathname: 'ratings' as const,
        params: { score },
      }
    }
    case 'settings':
      return { pathname: 'settings' as const }
    default:
      return undefined
  }
}

export const isFileUrl = (url: string) => {
  try {
    const u = new URL(url)
    return u.protocol === 'file:'
  } catch {
    return false
  }
}

export const getTitle = async (url: string) => {
  try {
    const u = new URL(url)
    switch (u.protocol) {
      case 'file:': {
        try {
          const directoryPath = window.electronAPI.fileURLToPath(url)
          if (!directoryPath) {
            throw new Error()
          }
          const entry = await window.entryAPI.getEntry(directoryPath)
          return entry.name
        } catch {
          return '<Error>'
        }
      }
      case 'zephy:':
        switch (u.host) {
          case 'ratings': {
            const score = Number(u.pathname.split('/')[1] ?? '')
            return `Ratings (${score})`
          }
          case 'settings':
            return 'Settings'
          default:
            throw new Error()
        }
      default:
        throw new Error()
    }
  } catch {
    return url
  }
}

export const getIconType = (url: string) => {
  try {
    const u = new URL(url)
    switch (u.protocol) {
      case 'file:': {
        return 'folder'
      }
      case 'zephy:':
        switch (u.host) {
          case 'ratings':
            return 'star'
          case 'settings':
            return 'settings'
          default:
            throw new Error()
        }
      default:
        throw new Error()
    }
  } catch {
    return 'error-outline'
  }
}
