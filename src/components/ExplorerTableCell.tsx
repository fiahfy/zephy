import { Box, TableCell, type TableCellProps, Typography } from '@mui/material'
import EntryDragGhost from '~/components/EntryDragGhost'
import EntryIcon from '~/components/EntryIcon'
import ExplorerNameTextField from '~/components/ExplorerNameTextField'
import Rating from '~/components/Rating'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useExplorerItem from '~/hooks/useExplorerItem'
import type { Content } from '~/interfaces'
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

  const { draggingContents, editing } = useExplorerItem(tabId, content)

  const { draggable, ...dragHandlers } = useDraggable(
    draggingContents.map((c) => c.path),
    <EntryDragGhost entries={draggingContents} />,
  )
  const { droppableStyle, ...dropHandlers } = useDroppable(
    content.type === 'directory' ? content.path : undefined,
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
              <ExplorerNameTextField content={content} tabId={tabId} />
            </Box>
          ) : (
            <Typography noWrap title={content.name} variant="caption">
              {content.name}
            </Typography>
          )}
        </Box>
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
