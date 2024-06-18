import { useEffect, useMemo, useState } from 'react'
import EmptyPreview from '~/components/EmptyPreview'
import { Entry } from '~/interfaces'

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
      const success = await (async () => {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = entry.url
          })
          return true
        } catch (e) {
          return false
        }
      })()
      setStatus(success ? 'loaded' : 'error')
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
          style={{
            backgroundColor: 'black',
            minHeight: 128,
            objectFit: 'contain',
            width: '100%',
          }}
        />
      ) : (
        <EmptyPreview message={message} />
      )}
    </>
  )
}

export default ImagePreview
