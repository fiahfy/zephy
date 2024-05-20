import { useEffect, useMemo, useReducer } from 'react'
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

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })

      const paths = await (async () => {
        if (entry.type !== 'directory') {
          return [entry.path]
        }
        try {
          const entries = await window.electronAPI.getEntries(entry.path)
          return entries
            .filter(
              (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((entry) => entry.path)
        } catch (e) {
          return []
        }
      })()

      const thumbnail = await (async () => {
        try {
          return await window.electronAPI.createEntryThumbnailUrl(paths)
        } catch (e) {
          return undefined
        }
      })()

      const success = await (async () => {
        if (!thumbnail) {
          return true
        }
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = thumbnail
          })
          return true
        } catch (e) {
          return false
        }
      })()

      if (unmounted) {
        return
      }

      dispatch({
        type: success ? 'loaded' : 'error',
        payload: { itemCount: paths.length, thumbnail },
      })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path, entry.type, entry.url, shouldShowHiddenFiles])

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
