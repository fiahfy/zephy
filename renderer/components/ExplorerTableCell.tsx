import { Box, TableCell, TableCellProps, Typography } from '@mui/material'
import { MouseEvent, SyntheticEvent, useCallback, useMemo } from 'react'

import EntryIcon from 'components/EntryIcon'
import NoOutlineRating from 'components/mui/NoOutlineRating'
import ExplorerNameTextField from 'components/ExplorerNameTextField'
import Outline from 'components/Outline'
import useDnd from 'hooks/useDnd'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  selectIsEditing,
  selectIsSelected,
  selectSelectedContents,
} from 'store/explorer'
import { rate } from 'store/rating'
import { formatDateTime, formatFileSize } from 'utils/formatter'

type Key = keyof Content

type Props = {
  align: TableCellProps['align']
  content: Content
  dataKey: Key
  height: number
  width?: number
}

const ExplorerTableCell = (props: Props) => {
  const { align, content, dataKey, height, width } = props

  const isEditing = useAppSelector(selectIsEditing)
  const isSelected = useAppSelector(selectIsSelected)
  const selectedContents = useAppSelector(selectSelectedContents)
  const dispatch = useAppDispatch()

  const { createDraggableBinder, createDroppableBinder, dropping } = useDnd()

  const editing = useMemo(
    () => isEditing(content.path),
    [content.path, isEditing],
  )

  const dragContents = useMemo(
    () =>
      editing
        ? undefined
        : isSelected(content.path)
        ? selectedContents
        : [content],
    [content, editing, isSelected, selectedContents],
  )

  const handleChangeRating = useCallback(
    (_e: SyntheticEvent, value: number | null) =>
      dispatch(rate({ path: content.path, rating: value ?? 0 })),
    [content.path, dispatch],
  )

  const handleClickRating = useCallback(
    (e: MouseEvent) => e.stopPropagation(),
    [],
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
        minWidth: 0,
        px: 1,
        py: 0,
        width,
      }}
      title={dataKey === 'name' ? content.name : undefined}
      {...(dataKey === 'name'
        ? {
            ...createDraggableBinder(dragContents),
            ...createDroppableBinder(content),
          }
        : {})}
    >
      {dataKey === 'name' && (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
            <Typography noWrap variant="caption">
              {content.name}
            </Typography>
          )}
        </Box>
      )}
      {/* TODO: improve performance on development */}
      {dataKey === 'rating' && (
        <NoOutlineRating
          onChange={handleChangeRating}
          onClick={handleClickRating}
          precision={0.5}
          size="small"
          value={content.rating}
        />
      )}
      {dataKey === 'size' && content.type === 'file' && (
        <Typography noWrap variant="caption">
          {formatFileSize(content.size)}
        </Typography>
      )}
      {dataKey === 'dateModified' && (
        <Typography noWrap variant="caption">
          {formatDateTime(content.dateModified)}
        </Typography>
      )}
      {dropping && <Outline />}
    </TableCell>
  )
}

export default ExplorerTableCell
