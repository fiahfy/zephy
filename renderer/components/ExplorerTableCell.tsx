import { TableCell, TableCellProps, Typography } from '@mui/material'
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react'

import EntryIcon from 'components/EntryIcon'
import DenseOutlineTextField from 'components/enhanced/DenseOutlineTextField'
import NoOutlineRating from 'components/enhanced/NoOutlineRating'
import useContextMenu from 'hooks/useContextMenu'
import usePreventClickOnDoubleClick from 'hooks/usePreventClickOnDoubleClick'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { rate, selectGetRating } from 'store/rating'
import { selectSelected } from 'store/window'
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

  const selected = useAppSelector(selectSelected)
  const getRating = useAppSelector(selectGetRating)
  const dispatch = useAppDispatch()

  const { createContentMenuHandler } = useContextMenu()
  const { handleClick, handleDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent<HTMLTableCellElement>) => {
      if (editing) {
        return e.stopPropagation()
      }
    },
    () => {
      if (
        dataKey === 'name' &&
        selected.length === 1 &&
        selected[0] === content.path
      ) {
        setEditing(true)
      }
    },
    (e: MouseEvent<HTMLTableCellElement>) => {
      if (editing) {
        return e.stopPropagation()
      }
    }
  )

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(content.name)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (editing && el) {
      el.focus()
      const index = content.name.lastIndexOf('.')
      if (index > 0) {
        el.setSelectionRange(0, index)
      } else {
        el.select()
      }
    }
  }, [content.name, editing])

  const handleBlur = () => setEditing(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNameInput(value)
  }

  return (
    <TableCell
      align={align}
      component="div"
      onClick={handleClick}
      onContextMenu={createContentMenuHandler(
        content.path,
        content.type === 'directory'
      )}
      onDoubleClick={handleDoubleClick}
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
          {editing ? (
            <DenseOutlineTextField
              inputRef={ref}
              onBlur={handleBlur}
              onChange={handleChange}
              sx={{ flexGrow: 1, ml: -0.5 }}
              value={nameInput}
            />
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
