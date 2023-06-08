import { TextField, TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'

const RoundedFilledTextField = styled((props: TextFieldProps) => (
  <TextField {...props} hiddenLabel size="small" variant="filled" />
))(({ theme }) =>
  theme.unstable_sx({
    '.MuiFilledInput-root': {
      borderRadius: 4,
      '&.Mui-focused': {
        '&:after': {
          opacity: 1,
        },
      },
      '&:before': {
        display: 'none',
      },
      '&:after': {
        border: `${theme.spacing(0.25)} solid ${theme.palette.primary.main}`,
        borderRadius: 4,
        content: '""',
        inset: 0,
        opacity: 0,
        pointerEvents: 'none',
        position: 'absolute',
        transform: 'unset',
        transition: `opacity ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeOut}}`,
      },
      '.MuiFilledInput-input': {
        py: 0.5,
        typography: 'body2',
      },
    },
  })
)

export default RoundedFilledTextField
