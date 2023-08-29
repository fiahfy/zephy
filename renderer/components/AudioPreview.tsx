import { Box, GlobalStyles, Typography } from '@mui/material'
import fileUrl from 'file-url'

import { Entry } from 'interfaces'

type Props = {
  entry: Entry
}

// TODO: save & restore volume
const AudioPreview = (props: Props) => {
  const { entry } = props

  return (
    <>
      <GlobalStyles
        styles={{
          'audio#custom-audio': {
            '&::-webkit-media-controls-enclosure': {
              borderRadius: 0,
            },
          },
        }}
      />
      <Box
        sx={{
          aspectRatio: '16 / 9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">Sound only</Typography>
        </Box>
        <audio
          controls
          id="custom-audio"
          src={fileUrl(entry.path)}
          style={{ width: '100%' }}
        />
      </Box>
    </>
  )
}

export default AudioPreview
