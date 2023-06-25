import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

import Icon from 'components/Icon'
import { useContextMenu } from 'hooks/useContextMenu'
import { useAppDispatch, useAppSelector } from 'store'
import { selectFavorites } from 'store/favorite'
import { changeDirectory } from 'store/window'

const FavoriteTable = () => {
  const favorites = useAppSelector(selectFavorites)
  const dispatch = useAppDispatch()

  const { createEntryMenuHandler } = useContextMenu()

  const [selected, setSelected] = useState<string[]>([])
  const [items, setItems] = useState<{ name: string; path: string }[]>([])

  useEffect(() => {
    ;(async () => {
      // TODO: filter out non-existent paths
      const names = await Promise.all(
        favorites.map((path) => window.electronAPI.basename(path))
      )
      const items = favorites
        .map((path, i) => ({
          name: names[i] ?? '',
          path,
        }))
        .sort((a, b) => (a.name > b.name ? 1 : -1))
      setItems(items)
    })()
  }, [favorites])

  const handleBlur = () => setSelected([])

  const handleClick = (path: string) => dispatch(changeDirectory(path))

  const handleFocus = (path: string) => setSelected([path])

  return (
    <Table size="small" sx={{ display: 'flex', userSelect: 'none' }}>
      <TableBody sx={{ width: '100%' }}>
        {items.map((item) => (
          <TableRow
            hover
            key={item.path}
            onBlur={() => handleBlur()}
            onClick={() => handleClick(item.path)}
            onContextMenu={createEntryMenuHandler(item.path, true)}
            onFocus={() => handleFocus(item.path)}
            selected={selected.includes(item.path)}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              width: '100%',
              '&:focus-visible': {
                outline: '-webkit-focus-ring-color auto 1px',
              },
            }}
            tabIndex={0}
            title={item.name}
          >
            <TableCell
              sx={{
                alignItems: 'center',
                borderBottom: 'none',
                display: 'flex',
                height: 20,
                gap: 1,
                px: 1,
                py: 0,
                width: '100%',
              }}
            >
              <Icon iconType="folder" size="small" />
              <Typography noWrap variant="caption">
                {item.name}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default FavoriteTable
