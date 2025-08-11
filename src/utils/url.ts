export const buildZephyUrl = (
  inputs:
    | { pathname: 'ratings'; params: { score: number } }
    | { pathname: 'settings' },
) => {
  switch (inputs.pathname) {
    case 'ratings':
      return `zephy://ratings/${inputs.params.score}`
    case 'settings':
      return 'zephy://settings'
  }
}

export const parseZephyUrl = (url: string) => {
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

export const isZephySchema = (url: string) => parseZephyUrl(url) !== undefined

export const getTitle = async (path: string) => {
  const parsed = parseZephyUrl(path)
  if (parsed) {
    switch (parsed.pathname) {
      case 'ratings':
        return `Ratings (${parsed.params.score})`
      case 'settings':
        return 'Settings'
    }
  }
  try {
    const entry = await window.electronAPI.getEntry(path)
    return entry.name
  } catch (_e) {
    return '<Error>'
  }
}

export const getIconType = (path: string) => {
  const parsed = parseZephyUrl(path)
  if (parsed) {
    switch (parsed.pathname) {
      case 'ratings':
        return 'star'
      case 'settings':
        return 'settings'
    }
  }
  return 'folder'
}
