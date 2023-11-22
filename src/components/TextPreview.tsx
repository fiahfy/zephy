import { Box, Typography } from '@mui/material'
import { useEffect, useMemo, useReducer } from 'react'
import { Entry } from '~/interfaces'

type State = {
  status: 'error' | 'loaded' | 'loading'
  text?: string
}

type Action =
  | {
      type: 'error'
    }
  | {
      type: 'loaded'
      payload: { text: string }
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...action.payload,
        status: action.type,
      }
    case 'loading':
    case 'error':
      return { status: action.type, text: undefined }
  }
}

type Props = {
  entry: Entry
}

const TextPreview = (props: Props) => {
  const { entry } = props

  const [{ status, text }, dispatch] = useReducer(reducer, {
    status: 'loading',
    text: undefined,
  })

  useEffect(() => {
    ;(async () => {
      dispatch({ type: 'loading' })
      try {
        const res = await fetch(entry.url)
        const text = await res.text()
        dispatch({ type: 'loaded', payload: { text } })
      } catch (e) {
        dispatch({ type: 'error' })
      }
    })()
  }, [entry.path, entry.type, entry.url])

  const message = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load'
      case 'loaded':
        return 'No preview'
    }
  }, [status])

  return (
    <>
      {status === 'loaded' ? (
        <Typography
          component="pre"
          sx={{
            p: 1,
            userSelect: 'text',
            whiteSpace: 'pre-wrap',
            width: '100%',
            wordBreak: 'break-word',
          }}
          variant="caption"
        >
          {text}
        </Typography>
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Box>
      )}
    </>
  )
}

export default TextPreview
