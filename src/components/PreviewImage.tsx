import { useEffect, useMemo, useState } from 'react'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import { useAppSelector } from '~/store'
import { selectPreviewContentUrl } from '~/store/preview'

const PreviewImage = () => {
  const url = useAppSelector(selectPreviewContentUrl)

  const [status, setStatus] = useState<'error' | 'loaded' | 'loading'>(
    'loading',
  )

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

  useEffect(() => {
    ;(async () => {
      if (!url) {
        return
      }
      setStatus('loading')
      const success = await new Promise<boolean>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
      })
      setStatus(success ? 'loaded' : 'error')
    })()
  }, [url])

  return (
    <>
      {status === 'loaded' ? (
        <img
          alt=""
          draggable={false}
          src={url}
          style={{
            flexShrink: 0,
            minHeight: 128,
            objectFit: 'contain',
            width: '100%',
          }}
        />
      ) : (
        <PreviewEmptyState message={message} />
      )}
    </>
  )
}

export default PreviewImage
