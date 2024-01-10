import { Box, TableCell, TableCellProps, Typography } from '@mui/material'
import { SyntheticEvent, useCallback, useMemo } from 'react'
import EntryIcon from '~/components/EntryIcon'
import NoOutlineRating from '~/components/mui/NoOutlineRating'
import ExplorerNameTextField from '~/components/ExplorerNameTextField'
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useExplorerItem from '~/hooks/useExplorerItem'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectSelectedContentsByTabIndex } from '~/store/explorer'
import { rate } from '~/store/rating'
import { formatDateTime, formatFileSize } from '~/utils/formatter'

type Key = keyof Content

type Props = {
  align: TableCellProps['align']
  content: Content
  dataKey: Key
  height: number
  tabIndex: number
  width?: number
}

const ExplorerTableCell = (props: Props) => {
  const { align, content, dataKey, height, tabIndex, width } = props

  const selectedContents = useAppSelector((state) =>
    selectSelectedContentsByTabIndex(state, tabIndex),
  )
  const dispatch = useAppDispatch()

  const { editing, selected } = useExplorerItem(tabIndex, content)

  const dragContents = useMemo(
    () => (editing ? [] : selected ? selectedContents : [content]),
    [content, editing, selected, selectedContents],
  )

  const { draggable, ...dragHandlers } = useDragEntry(dragContents)
  const { droppableStyle, ...dropHandlers } = useDropEntry(content)

  const handleChangeRating = useCallback(
    (_e: SyntheticEvent, value: number | null) =>
      dispatch(rate({ path: content.path, rating: value ?? 0 })),
    [content.path, dispatch],
  )

  // Rating component rendering is slow, so use useMemo to avoid unnecessary rendering
  const rating = useMemo(
    () => (
      <NoOutlineRating
        onChange={handleChangeRating}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        precision={0.5}
        size="small"
        value={content.rating}
      />
    ),
    [content.rating, handleChangeRating],
  )

  return (
    <TableCell
      align={align}
      component="div"
      sx={{
        borderBottom: 'none',
        display: 'flex',
        flexGrow: width ? 0 : 1,
        flexShrink: width ? 0 : 1,
        height,
        minWidth: width ? 0 : 100,
        px: 1,
        py: 0,
        width,
        ...droppableStyle,
      }}
      {...(dataKey === 'name'
        ? {
            draggable,
            ...dragHandlers,
            ...dropHandlers,
          }
        : {})}
    >
      {dataKey === 'name' && (
        <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, maxWidth: '100%' }}>
          <EntryIcon entry={content} />
          {editing ? (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                ml: -0.5,
              }}
            >
              <ExplorerNameTextField content={content} />
            </Box>
          ) : (
            <Typography noWrap title={content.name} variant="caption">
              {content.name}
            </Typography>
          )}
        </Box>
      )}
      {dataKey === 'rating' && rating}
      {dataKey === 'size' && content.type !== 'directory' && (
        <Typography noWrap variant="caption">
          {formatFileSize(content.size)}
        </Typography>
      )}
      {dataKey === 'dateModified' && (
        <Typography noWrap variant="caption">
          {formatDateTime(content.dateModified)}
        </Typography>
      )}
    </TableCell>
  )
}

export default ExplorerTableCell
