import { useMemo } from 'react'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectIsFavorite } from '~/store/favorite'
import { createContextMenuHandler } from '~/utils/contextMenu'

const useEntryItem = (entry: Entry) => {
  const favorite = useAppSelector(selectIsFavorite)(entry.path)

  const onContextMenu = useMemo(() => {
    const directory = entry.type === 'directory'
    const path = entry.path
    return createContextMenuHandler([
      {
        type: directory ? 'openDirectory' : 'open',
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
