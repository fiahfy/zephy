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

  const load = useCallback(
    async (entry: Entry) => {
      await s.acquire()

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

      s.release()

      return { itemCount: paths.length, thumbnail }
    },
    [s, shouldShowHiddenFiles],
  )

  const value = { load }

  return (
    <ThumbnailContext.Provider value={value}>
      {children}
    </ThumbnailContext.Provider>
  )
}
