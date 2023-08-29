import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import DenseOutlineTextField from 'components/mui/DenseOutlineTextField'
import useContextMenu from 'hooks/useContextMenu'
import { Content } from 'interfaces'
import { useAppDispatch } from 'store'
import { finishEditing, rename } from 'store/explorer'

type Props = {
  content: Content
}

const ExplorerNameTextField = (props: Props) => {
  const { content } = props

  const dispatch = useAppDispatch()

  const { defaultMenuHandler } = useContextMenu()

  const [name, setName] = useState(content.name)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    el.focus()
    const index = content.name.lastIndexOf('.')
    if (index > 0) {
      el.setSelectionRange(0, index)
    } else {
      el.select()
    }
  }, [content.name])

  const finish = useCallback(() => {
    dispatch(finishEditing())
    if (name !== content.name) {
      dispatch(rename(content.path, name))
    }
  }, [content.name, content.path, dispatch, name])

  const handleBlur = useCallback(() => finish(), [finish])

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

  return (
    <DenseOutlineTextField
      fullWidth
      inputRef={ref}
      onBlur={handleBlur}
      onChange={handleChange}
      onContextMenu={defaultMenuHandler}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      sx={{ '.MuiInputBase-root': { color: 'inherit' } }}
      value={name}
    />
  )
}

export default ExplorerNameTextField
