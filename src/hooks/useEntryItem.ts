import { useMemo } from 'react'
import type { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import { createContextMenuHandler } from '~/utils/context-menu'

const useEntryItem = (entry: Entry) => {
  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), entry.path),
  )

  const onContextMenu = useMemo(() => {
    const directory = entry.type === 'directory'
    const path = entry.path
    return createContextMenuHandler([
      {
        type: 'open',
        data: { path },
      },
      ...(directory
        ? [
            {
              type: 'openInNewWindow',
              data: { path },
            },
            {
              type: 'openInNewTab',
              data: { path },
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
  }, [entry.path, entry.type, favorite])

  return { onContextMenu }
}

export default useEntryItem
