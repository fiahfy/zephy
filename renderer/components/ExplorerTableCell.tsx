import { Box, TableCell, TableCellProps, Typography } from '@mui/material'

import EntryIcon from 'components/EntryIcon'
import NoOutlineRating from 'components/mui/NoOutlineRating'
import ExplorerNameTextField from 'components/ExplorerNameTextField'
import Outline from 'components/Outline'
import useFileDnd from 'hooks/useFileDnd'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  selectIsEditing,
  selectIsSelected,
  selectSelectedContents,
} from 'store/explorer'
import { rate } from 'store/rating'
import { formatDate, formatFileSize } from 'utils/formatter'

type Key = keyof Content

type Props = {
  align: TableCellProps['align']
  content: Content
  dataKey: Key
  height: number
}

const ExplorerTableCell = (props: Props) => {
  const { align, content, height, dataKey } = props

  const isEditing = useAppSelector(selectIsEditing)
  const isSelected = useAppSelector(selectIsSelected)
  const selectedContents = useAppSelector(selectSelectedContents)
  const dispatch = useAppDispatch()

  const editing = isEditing(content.path)

  const { createDraggableProps, createDroppableProps, dropping } = useFileDnd()

  const draggingContents = editing
    ? undefined
    : isSelected(content.path)
    ? selectedContents
    : [content]

  return (
    <TableCell
      align={align}
      component="div"
      sx={{
        alignItems: 'center',
        borderBottom: 'none',
        display: 'flex',
        gap: 1,
        height,
        position: 'relative',
        px: 1,
        py: 0,
        userSelect: 'none',
      }}
      title={dataKey === 'name' ? content.name : undefined}
      {...(dataKey === 'name'
        ? {
            ...createDraggableProps(draggingContents),
            ...createDroppableProps(content),
          }
        : {})}
    >
      {dataKey === 'name' && (
        <>
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
        </>
      )}
      {dataKey === 'rating' && (
        <NoOutlineRating
          onChange={(_e, value) =>
            dispatch(rate({ path: content.path, rating: value ?? 0 }))
          }
          onClick={(e) => e.stopPropagation()}
          precision={0.5}
          size="small"
          value={content.rating}
        />
      )}
      {dataKey === 'size' && content.type === 'file' && (
        <Typography noWrap variant="caption">
          {formatFileSize(content.size)}{' '}
        </Typography>
      )}
      {dataKey === 'dateModified' && (
        <Typography noWrap variant="caption">
          {formatDate(content.dateModified)}
        </Typography>
      )}
      {dropping && <Outline />}
    </TableCell>
  )
}

export default ExplorerTableCell
