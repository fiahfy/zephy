import { Entry } from '~/interfaces'

type Props = {
  entry: Entry
}

const ImagePreview = (props: Props) => {
  const { entry } = props

  return (
    <img
      src={entry.url}
      style={{ minHeight: 128, objectFit: 'contain', width: '100%' }}
    />
  )
}

export default ImagePreview
