import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'

import DenseOutlineTextField from 'components/mui/DenseOutlineTextField'
import { Content } from 'interfaces'
import { useAppDispatch } from 'store'
import { finishEditing, rename } from 'store/explorer'

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
    if (index > 0) {
      el.setSelectionRange(0, index)
    } else {
      el.select()
    }
  }, [content.name])

  const finish = () => {
    dispatch(finishEditing())
    if (name !== content.name) {
      dispatch(rename(content.path, name))
    }
  }

  const handleBlur = () => finish()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
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
  }

  return (
    <DenseOutlineTextField
      fullWidth
      inputRef={ref}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      sx={{ '.MuiInputBase-root': { color: 'inherit' } }}
      value={name}
    />
  )
}

export default ExplorerNameTextField
