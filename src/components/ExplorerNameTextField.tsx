import { Stack, TextField, Typography } from '@mui/material'
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Content } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { finishEditing, rename } from '~/store/explorer-list'
import { createContextMenuHandler } from '~/utils/context-menu'

type Props = {
  content: Content
  multiline?: boolean
  readOnly: boolean
  tabId: number
}

const ExplorerNameTextField = (props: Props) => {
  const { content, multiline = false, readOnly, tabId } = props

  const dispatch = useAppDispatch()

  const [name, setName] = useState(content.name)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!readOnly) {
      setName(content.name)
    }
  }, [content.name, readOnly])

  useEffect(() => {
    if (readOnly) {
      return
    }
    const el = ref.current
    if (!el) {
      return
    }
    const timer = window.setTimeout(() => {
      el.focus()
      if (content.type === 'file') {
        const index = el.value.lastIndexOf('.')
        el.setSelectionRange(0, index)
      } else {
        el.select()
      }
    })
    return () => clearTimeout(timer)
  }, [content.type, readOnly])

  const finish = useCallback(() => {
    dispatch(finishEditing(tabId))
    if (name !== content.name) {
      dispatch(rename(tabId, content.path, name))
    }
  }, [content.name, content.path, dispatch, name, tabId])

  const handleBlur = useCallback(
    () => window.setTimeout(() => finish()),
    [finish],
  )

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation()
      switch (e.key) {
        case 'Escape':
          dispatch(finishEditing(tabId))
          break
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            finish()
          }
          break
      }
    },
    [dispatch, finish, tabId],
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // NOTE: Prevent parent mouse down event
    e.stopPropagation()
  }, [])

  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

  return (
    <>
      {readOnly ? (
        <Typography
          noWrap
          sx={
            multiline
              ? {
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  display: '-webkit-box',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'initial',
                  wordBreak: 'break-all',
                }
              : undefined
          }
          title={content.name}
          variant="caption"
        >
          {content.name}
        </Typography>
      ) : (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexGrow: 1,
            ml: -0.5,
          }}
        >
          <TextField
            fullWidth
            hiddenLabel
            inputRef={ref}
            maxRows={2}
            multiline={multiline}
            onBlur={handleBlur}
            onChange={handleChange}
            onContextMenu={handleContextMenu}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            size="small"
            spellCheck={false}
            sx={(theme) => ({
              '.MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
                p: 0,
                '.MuiInputBase-input': {
                  ...theme.typography.caption,
                  wordBreak: 'break-all',
                  height: 18,
                  px: 0.5,
                  py: 0,
                },
              },
            })}
            value={name}
            variant="outlined"
          />
        </Stack>
      )}
    </>
  )
}

export default ExplorerNameTextField
