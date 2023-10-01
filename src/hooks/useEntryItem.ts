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
        id: directory ? 'openDirectory' : 'open',
        data: { path },
      },
      ...(directory
        ? [
            {
              id: 'openDirectoryInNewWindow',
              data: { path },
            },
          ]
        : []),
      {
        id: 'revealInFinder',
        data: { path },
      },
      { id: 'separator' },
      {
        id: 'copyPath',
        data: { path },
      },
      { id: 'separator' },
      ...(directory
        ? [
            {
              id: 'toggleFavorite',
              data: { path, favorite: isFavorite(path) },
            },
          ]
        : []),
      { id: 'separator' },
      {
        id: 'moveToTrash',
        data: { paths: [path] },
      },
    ])
  }, [entry.path, entry.type, isFavorite])

  return { onContextMenu }
}

export default useEntryItem
