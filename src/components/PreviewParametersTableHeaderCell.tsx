import { TableCell, Typography } from '@mui/material'

type Props = {
  label: string
}

const PreviewParametersTableHeaderCell = (props: Props) => {
  const { label } = props

  return (
    <TableCell
      colSpan={2}
      component="th"
      sx={{
        borderBottom: 0,
        height: 20,
        px: 1,
        py: 0,
      }}
    >
      <Typography
        noWrap
        sx={{
          color: (theme) => theme.palette.text.secondary,
          display: 'block',
          fontWeight: 'bold',
        }}
        variant="caption"
      >
        {label}
      </Typography>
    </TableCell>
  )
}

export default PreviewParametersTableHeaderCell
