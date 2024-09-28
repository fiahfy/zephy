import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import DenseOutlineTextField from '~/components/mui/DenseOutlineTextField'
import type { Content } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { finishEditing, rename } from '~/store/explorer'
import { createContextMenuHandler } from '~/utils/contextMenu'

type Props = {
  content: Content
}

const ExplorerNameTextField = (props: Props) => {
  const { content } = props

  const dispatch = useAppDispatch()

  const [name, setName] = useState(content.name)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    el.focus()
    const index = content.name.lastIndexOf('.')
    if (content.type !== 'directory' && index > 0) {
      el.setSelectionRange(0, index)
    } else {
      el.select()
    }
  }, [content.name, content.type])

  const finish = useCallback(() => {
    dispatch(finishEditing())
    if (name !== content.name) {
      dispatch(rename(content.path, name))
    }
  }, [content.name, content.path, dispatch, name])

  const handleBlur = useCallback(
    () => window.setTimeout(() => finish(), 300),
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
          dispatch(finishEditing())
          break
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            finish()
          }
          break
      }
    },
    [dispatch, finish],
  )

  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

  return (
    <DenseOutlineTextField
      fullWidth
      inputRef={ref}
      onBlur={handleBlur}
      onChange={handleChange}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      sx={{
        '.MuiInputBase-root': {
          backgroundColor: (theme) => theme.palette.background.default,
        },
      }}
      value={name}
    />
  )
}

export default ExplorerNameTextField
