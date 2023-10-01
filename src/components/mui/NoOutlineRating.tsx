import { Rating } from '@mui/material'
import { styled } from '@mui/material/styles'

const NoOutlineRating = styled(Rating)(({ theme }) =>
  theme.unstable_sx({
    '&.Mui-focusVisible': {
      '.MuiRating-iconActive': {
        outline: 'none',
      },
    },
    '.MuiRating-labelEmptyValueActive': {
      outline: 'none',
    },
  }),
)

export default NoOutlineRating
