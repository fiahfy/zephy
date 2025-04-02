import { TableCell, Typography } from '@mui/material'

type Props = {
  label: string
}

const PreviewParametersTableCell = (props: Props) => {
  const { label } = props

  return (
    <TableCell
      colSpan={2}
      sx={{
        borderBottom: 0,
        height: 20,
        px: 1,
        py: 0,
      }}
    >
      <Typography
        sx={{
          display: 'block',
          userSelect: 'text',
          whiteSpace: 'pre-wrap',
        }}
        variant="caption"
      >
        {label}
      </Typography>
    </TableCell>
  )
}

export default PreviewParametersTableCell
