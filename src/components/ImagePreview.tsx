import { useEffect, useMemo, useState } from 'react'
import { Entry } from '~/interfaces'
import EmptyPreview from './EmptyPreview'

type Props = {
  entry: Entry
}

const ImagePreview = (props: Props) => {
  const { entry } = props

  const [status, setStatus] = useState<'error' | 'loaded' | 'loading'>(
    'loading',
  )

  useEffect(() => {
    ;(async () => {
      setStatus('loading')
      try {
        await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(undefined)
          img.onerror = (e) => reject(e)
          img.src = entry.url
        })
        setStatus('loaded')
      } catch (e) {
        setStatus('error')
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
        <img
          src={entry.url}
          style={{ minHeight: 128, objectFit: 'contain', width: '100%' }}
        />
      ) : (
        <EmptyPreview message={message} />
      )}
    </>
  )
}

export default ImagePreview
