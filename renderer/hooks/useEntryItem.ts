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
        params: { path },
      },
      ...(directory
        ? [
            {
              id: 'openDirectoryInNewWindow',
              params: { path },
            },
          ]
        : []),
      {
        id: 'revealInFinder',
        params: { path },
      },
      { id: 'separator' },
      {
        id: 'copyPath',
        params: { path },
      },
      { id: 'separator' },
      ...(directory
        ? [
            {
              id: 'toggleFavorite',
              params: { path, favorite: isFavorite(path) },
            },
          ]
        : []),
      { id: 'separator' },
      {
        id: 'moveToTrash',
        params: { paths: [path] },
      },
    ])
  }, [entry.path, entry.type, isFavorite])

  return { onContextMenu }
}

export default useEntryItem
