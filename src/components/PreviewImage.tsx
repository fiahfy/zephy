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

  useEffect(() => {
    ;(async () => {
      setStatus('loading')
      const success = await (async () => {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = entry.url
          })
          return true
        } catch {
          return false
        }
      })()
      setStatus(success ? 'loaded' : 'error')
    })()
  }, [entry.url])

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
