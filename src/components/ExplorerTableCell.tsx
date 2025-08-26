import {
  Stack,
  TableCell,
  type TableCellProps,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import EntryIcon from '~/components/EntryIcon'
import EntryNameTextField from '~/components/EntryNameTextField'
import Rating from '~/components/ExplorerRating'
import useExplorerItem from '~/hooks/useExplorerItem'
import type { Content } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { finishEditing, rename } from '~/store/explorer-list'
import { formatDateTime, formatFileSize } from '~/utils/formatter'

type Key = keyof Content

type Props = {
  align: TableCellProps['align']
  content: Content
  dataKey: Key
  height: number
  tabId: number
  width?: number
}

const ExplorerTableCell = (props: Props) => {
  const { align, content, dataKey, height, tabId, width } = props

  const dispatch = useAppDispatch()

  const { editing } = useExplorerItem(tabId, content)

  const handleFinish = useCallback(
    (changedValue: string | undefined) => {
      dispatch(finishEditing({ tabId }))
      if (changedValue) {
        dispatch(rename(tabId, content.path, changedValue))
      }
    },
    [content.path, dispatch, tabId],
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
      }}
    >
      {dataKey === 'name' && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexGrow: 1, maxWidth: '100%' }}
        >
          <EntryIcon entry={content} />
          <EntryNameTextField
            entry={content}
            onFinish={handleFinish}
            readOnly={!editing}
          />
        </Stack>
      )}
      {dataKey === 'score' && <Rating path={content.path} />}
      {dataKey === 'size' && content.type !== 'directory' && (
        <Typography noWrap variant="caption">
          {formatFileSize(content.size)}
        </Typography>
      )}
      {dataKey === 'dateCreated' && (
        <Typography noWrap variant="caption">
          {formatDateTime(content.dateCreated)}
        </Typography>
      )}
      {dataKey === 'dateModified' && (
        <Typography noWrap variant="caption">
          {formatDateTime(content.dateModified)}
        </Typography>
      )}
      {dataKey === 'dateLastOpened' && (
        <Typography noWrap variant="caption">
          {formatDateTime(content.dateLastOpened)}
        </Typography>
      )}
    </TableCell>
  )
}

export default ExplorerTableCell
