import { Entry } from '~/interfaces'

type Props = {
  entry: Entry
}

const ImagePreview = (props: Props) => {
  const { entry } = props

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={entry.url}
      style={{ minHeight: 128, objectFit: 'contain', width: '100%' }}
    />
  )
}

export default ImagePreview
