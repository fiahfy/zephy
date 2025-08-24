import { Box, Typography } from '@mui/material'
import { useEffect, useMemo, useReducer } from 'react'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import { useAppSelector } from '~/store'
import { selectPreviewContent } from '~/store/preview'

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

const PreviewText = () => {
  const content = useAppSelector(selectPreviewContent)

  const [{ status, text }, dispatch] = useReducer(reducer, {
    status: 'loading',
    text: undefined,
  })

  const url = useMemo(() => content?.url, [content?.url])

  useEffect(() => {
    ;(async () => {
      if (!url) {
        return
      }
      dispatch({ type: 'loading' })
      try {
        const res = await fetch(url)
        const text = await res.text()
        dispatch({ type: 'loaded', payload: { text } })
      } catch {
        dispatch({ type: 'error' })
      }
    })()
  }, [url])

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
        <Box sx={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
          <Typography
            component="pre"
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              p: 1,
              userSelect: 'text',
              whiteSpace: 'pre-wrap',
              width: '100%',
              wordBreak: 'break-word',
            })}
            variant="caption"
          >
            {text}
          </Typography>
        </Box>
      ) : (
        <PreviewEmptyState message={message} />
      )}
    </>
  )
}

export default PreviewText
