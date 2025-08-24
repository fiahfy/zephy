import { useMemo } from 'react'
import FavoriteTable from '~/components/FavoriteTable'
import Panel from '~/components/Panel'
import { useAppSelector } from '~/store'
import { selectFavorite, selectFavorites } from '~/store/favorite'

const FavoritePanel = () => {
  const favorites = useAppSelector((state) =>
    selectFavorites(selectFavorite(state)),
  )

  const sortedFavorites = useMemo(
    () => favorites.toSorted((a, b) => a.name.localeCompare(b.name)),
    [favorites],
  )

  return (
    <>
      {sortedFavorites.length > 0 && (
        <Panel title="Favorites">
          <FavoriteTable favorites={sortedFavorites} />
        </Panel>
      )}
    </>
  )
}

export default FavoritePanel
