import { TableCell, TableCellProps, Typography } from '@mui/material'

import EntryIcon from 'components/EntryIcon'
import NoOutlineRating from 'components/enhanced/NoOutlineRating'
import { useContextMenu } from 'hooks/useContextMenu'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { rate, selectGetRating } from 'store/rating'
import { formatDate, formatFileSize } from 'utils/file'

type Key = keyof Content

type Props = {
  align: TableCellProps['align']
  content: Content
  dataKey: Key
  height: number
}

const ExplorerTableCell = (props: Props) => {
  const { align, content, height, dataKey } = props

  const getRating = useAppSelector(selectGetRating)
  const dispatch = useAppDispatch()

  const { createContentMenuHandler } = useContextMenu()

  return (
    <TableCell
      align={align}
      component="div"
      onContextMenu={createContentMenuHandler(
        content.path,
        content.type === 'directory'
      )}
      sx={{
        alignItems: 'center',
        borderBottom: 'none',
        display: 'flex',
        gap: 1,
        height,
        px: 1,
        py: 0,
        userSelect: 'none',
      }}
      title={dataKey === 'name' ? content.name : undefined}
    >
      {dataKey === 'name' && (
        <>
          <EntryIcon entry={content} size="small" />
          <Typography noWrap variant="caption">
            {content.name}
          </Typography>
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
          value={getRating(content.path)}
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
    </TableCell>
  )
}

export default ExplorerTableCell
