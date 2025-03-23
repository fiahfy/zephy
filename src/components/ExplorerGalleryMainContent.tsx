import { Box, Typography } from '@mui/material'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import type { Content } from '~/interfaces'

type Props = {
  content: Content
}

const ExplorerGalleryMainContent = (props: Props) => {
  const { content } = props

  const { message, status, thumbnail } = useEntryThumbnail(content)

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {status === 'loaded' && thumbnail ? (
        <img
          alt=""
          src={thumbnail}
          style={{
            display: 'block',
            objectFit: 'contain',
            objectPosition: 'center',
            width: '100%',
          }}
        />
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
    </Box>
  )
}

export default ExplorerGalleryMainContent
