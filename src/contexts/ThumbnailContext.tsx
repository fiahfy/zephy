import { semaphore } from '@fiahfy/semaphore'
import { ReactNode, createContext, useCallback } from 'react'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

export const ThumbnailContext = createContext<
  | {
      load: (entry: Entry) => Promise<{ itemCount: number; thumbnail?: string }>
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const ThumbnailProvider = (props: Props) => {
  const { children } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const s = semaphore(10)

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

  const load = useCallback(
    async (entry: Entry) => {
      await s.acquire()
      const paths = await getPaths(entry)
      const thumbnail = await getThumbnail(paths)
      s.release()
      return { itemCount: paths.length, thumbnail }
    },
    [getPaths, getThumbnail, s],
  )

  const value = { load }

  return (
    <ThumbnailContext.Provider value={value}>
      {children}
    </ThumbnailContext.Provider>
  )
}
