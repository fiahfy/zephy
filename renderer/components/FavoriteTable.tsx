import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import Icon from 'components/Icon'
import { useContextMenu } from 'hooks/useContextMenu'
import { useAppSelector } from 'store'
import { selectFavorites } from 'store/favorite'

const FavoriteTable = () => {
  const favorites = useAppSelector(selectFavorites)

  const { openEntry } = useContextMenu()

  const [selected, setSelected] = useState<string[]>([])
  const [items, setItems] = useState<{ name: string; path: string }[]>([])

  useEffect(() => {
    ;(async () => {
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

  const handleFocus = (path: string) => setSelected([path])

  return (
    <Table size="small" sx={{ display: 'flex' }}>
      <TableBody sx={{ width: '100%' }}>
        {items.map((item) => (
          <TableRow
            hover
            key={item.path}
            onBlur={() => handleBlur()}
            onContextMenu={openEntry(item.path, true)}
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
          >
            <TableCell
              sx={{
                alignItems: 'center',
                borderBottom: 'none',
                display: 'flex',
                height: 20,
                px: 1,
                py: 0,
                width: '100%',
              }}
            >
              <Box
                component="span"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box sx={{ alignItems: 'center', display: 'flex' }}>
                  <Box sx={{ alignItems: 'center', display: 'flex', mr: 1 }}>
                    <Icon iconType="folder" size="small" />
                  </Box>
                  <Typography noWrap title={item.name} variant="caption">
                    {item.name}
                  </Typography>
                </Box>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default FavoriteTable
