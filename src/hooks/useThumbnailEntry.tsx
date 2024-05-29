import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

type State = {
  itemCount?: number
  status: 'error' | 'loaded' | 'loading'
  thumbnail?: string
}

type Action =
  | {
      type: 'error'
      payload: { itemCount: number; thumbnail?: string }
    }
  | {
      type: 'loaded'
      payload: { itemCount: number; thumbnail?: string }
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'error':
    case 'loaded':
      return {
        ...action.payload,
        status: action.type,
      }
    case 'loading':
      return { itemCount: undefined, status: action.type, thumbnail: undefined }
  }
}

const useThumbnailEntry = (entry: Entry) => {
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const [{ itemCount, status, thumbnail }, dispatch] = useReducer(reducer, {
    itemCount: undefined,
    status: 'loading',
    thumbnail: undefined,
  })

  const getPaths = useCallback(
    async (entry: Entry) => {
      if (entry.type !== 'directory') {
        return [entry.path]
      }
      try {
        const entries = await window.electronAPI.getEntries(entry.path)
        return entries
          .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((entry) => entry.path)
      } catch (e) {
        return []
      }
    },
    [shouldShowHiddenFiles],
  )

  const getThumbnail = useCallback(async (paths: string[]) => {
    try {
      return await window.electronAPI.createEntryThumbnailUrl(paths)
    } catch (e) {
      return undefined
    }
  }, [])

  const loadImage = useCallback(async (url?: string) => {
    if (!url) {
      return true
    }
    try {
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(undefined)
        img.onerror = (e) => reject(e)
        img.src = url
      })
      return true
    } catch (e) {
      return false
    }
  }, [])

  useEffect(() => {
    let unmounted = false

    const timer = window.setTimeout(() => {
      ;(async () => {
        dispatch({ type: 'loading' })

        const paths = await getPaths(entry)
        const thumbnail = await getThumbnail(paths)
        const success = await loadImage(thumbnail)

        if (unmounted) {
          return
        }

        dispatch({
          type: success ? 'loaded' : 'error',
          payload: { itemCount: paths.length, thumbnail },
        })
      })()
    }, 100)

    return () => {
      unmounted = true
      window.clearTimeout(timer)
    }
  }, [entry, getPaths, getThumbnail, loadImage])

  const message = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load'
      case 'loaded':
        return 'No preview'
    }
  }, [status])

  return { itemCount, message, status, thumbnail }
}

export default useThumbnailEntry
