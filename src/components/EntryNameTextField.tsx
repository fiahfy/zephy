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
import type { Entry } from '~/interfaces'
import { createContextMenuHandler } from '~/utils/context-menu'

type Props = {
  entry: Entry
  multiline?: boolean
  onFinish: (changedValue: string | undefined) => void
  readOnly: boolean
}

const EntryNameTextField = (props: Props) => {
  const { entry, multiline = false, onFinish, readOnly } = props

  const [name, setName] = useState(entry.name)

  const ref = useRef<HTMLInputElement>(null)

  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

  const finish = useCallback(
    (shouldSave: boolean) => {
      if (shouldSave && name !== entry.name) {
        onFinish(name)
      } else {
        onFinish(undefined)
      }
    },
    [entry.name, name, onFinish],
  )

  const handleBlur = useCallback(
    () => window.setTimeout(() => finish(true)),
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
          finish(false)
          break
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            finish(true)
          }
          break
      }
    },
    [finish],
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // NOTE: Prevent parent mouse down event
    e.stopPropagation()
  }, [])

  useEffect(() => {
    if (!readOnly) {
      setName(entry.name)
    }
  }, [entry.name, readOnly])

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
      if (entry.type === 'file') {
        const index = el.value.lastIndexOf('.')
        el.setSelectionRange(0, index)
      } else {
        el.select()
      }
    })
    return () => clearTimeout(timer)
  }, [entry.type, readOnly])

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
          title={entry.name}
          variant="caption"
        >
          {entry.name}
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

export default EntryNameTextField
