import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { Entry } from '~/interfaces'
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

const useEntryThumbnail = (entry: Entry) => {
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const [{ itemCount, status, thumbnail }, dispatch] = useReducer(reducer, {
    itemCount: undefined,
    status: 'loading',
    thumbnail: undefined,
  })

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

  const getPaths = useCallback(
    async (path: string) => {
      try {
        const entries = await window.entryAPI.getEntries(path)
        return entries
          .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name))
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((entry) => entry.path)
      } catch {
        return []
      }
    },
    [shouldShowHiddenFiles],
  )

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      dispatch({ type: 'loading' })

      const paths =
        entry.type === 'directory' ? await getPaths(entry.path) : [entry.path]
      const thumbnail = await window.entryAPI.createEntryThumbnailUrl(paths)
      const success = await new Promise<boolean>((resolve) => {
        if (!thumbnail) {
          return resolve(true)
        }
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = thumbnail
      })

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
  }, [entry.path, entry.type, getPaths])

  return { itemCount, message, status, thumbnail }
}

export default useEntryThumbnail
