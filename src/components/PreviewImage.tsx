import { useEffect, useMemo, useState } from 'react'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import type { Entry } from '~/interfaces'

type Props = {
  entry: Entry
}

const PreviewImage = (props: Props) => {
  const { entry } = props

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
      setStatus('loading')
      const success = await new Promise<boolean>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = entry.url
      })
      setStatus(success ? 'loaded' : 'error')
    })()
  }, [entry.url])

  return (
    <>
      {status === 'loaded' ? (
        <img
          alt=""
          draggable={false}
          src={entry.url}
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
