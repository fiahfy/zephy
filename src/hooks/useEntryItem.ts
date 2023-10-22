import { useMemo } from 'react'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectIsFavorite } from '~/store/favorite'
import { createMenuHandler } from '~/utils/contextMenu'

const useEntryItem = (entry: Entry) => {
  const isFavorite = useAppSelector(selectIsFavorite)

  const onContextMenu = useMemo(() => {
    const directory = entry.type === 'directory'
    const path = entry.path
    return createMenuHandler([
      {
        type: directory ? 'openDirectory' : 'open',
        data: { path },
      },
      ...(directory
        ? [
            {
              type: 'openDirectoryInNewWindow',
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
              data: { path, favorite: isFavorite(path) },
            },
          ]
        : []),
      { type: 'separator' },
      {
        type: 'moveToTrash',
        data: { paths: [path] },
      },
    ])
  }, [entry.path, entry.type, isFavorite])

  return { onContextMenu }
}

export default useEntryItem
