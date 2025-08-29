import { useMemo } from 'react'
import type { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import { selectCurrentTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

const useEntryItem = (entry: Entry) => {
  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), entry.path),
  )
  const tabId = useAppSelector(selectCurrentTabId)

  const onContextMenu = useMemo(() => {
    const directory = entry.type === 'directory'
    const path = entry.path
    const url = entry.url
    return createContextMenuHandler([
      {
        type: 'open',
        data: { url },
      },
      ...(directory
        ? [
            {
              type: 'openInNewWindow',
              data: { url },
            },
            {
              type: 'openInNewTab',
              data: { url, tabId },
            },
          ]
        : []),
      {
        type: 'revealInFinder',
        data: { path },
      },
      { type: 'separator' },
      {
        type: 'copyPath',
        data: { path },
      },
      { type: 'separator' },
      ...(directory
        ? [
            {
              type: 'toggleFavorite',
              data: { path, favorite },
            },
          ]
        : []),
      { type: 'separator' },
      {
        type: 'moveToTrash',
        data: { paths: [path] },
      },
    ])
  }, [entry.path, entry.type, entry.url, favorite, tabId])

  return { onContextMenu }
}

export default useEntryItem
