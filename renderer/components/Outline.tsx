import { Box } from '@mui/material'

const Outline = () => (
  <Box
    sx={{
      border: (theme) =>
        `${theme.spacing(0.25)} solid ${theme.palette.primary.main}`,
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
    }}
  />
)

export default Outline
