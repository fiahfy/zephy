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

export const getPath = (url: string) => {
  try {
    const u = new URL(url)
    switch (u.protocol) {
      case 'file:':
        return decodeURIComponent(u.pathname)
      case 'zephy:':
        throw new Error()
      default:
        throw new Error()
    }
  } catch {
    return undefined
  }
}

export const getTitle = async (url: string) => {
  try {
    const u = new URL(url)
    switch (u.protocol) {
      case 'file:': {
        const entry = await window.electronAPI.getEntry(
          decodeURIComponent(u.pathname),
        )
        return entry.name
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
    return '<Error>'
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
    return 'folder'
  }
}
