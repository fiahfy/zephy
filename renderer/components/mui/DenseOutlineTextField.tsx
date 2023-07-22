import { TextField, TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'

const DenseOutlineTextField = styled((props: TextFieldProps) => (
  <TextField {...props} hiddenLabel size="small" variant="outlined" />
))(({ theme }) =>
  theme.unstable_sx({
    '.MuiInputBase-input': {
      ...theme.typography.caption,
      height: '1.125rem',
      px: 0.5,
      py: 0,
    },
  }),
)

export default DenseOutlineTextField
