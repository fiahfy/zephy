import { Rating as MuiRating, Table, TableBody, TableCell } from '@mui/material'
import RatingTableRow from '~/components/RatingTableRow'

type Props = {
  ratings: {
    score: number
    count: number
  }[]
}

const RatingTable = (props: Props) => {
  const { ratings } = props

  return (
    <Table size="small" sx={{ display: 'flex' }}>
      <TableBody sx={{ width: '100%' }}>
        {ratings.map((rating) => (
          <RatingTableRow key={rating.score} score={rating.score}>
            <TableCell
              sx={{
                alignItems: 'center',
                borderBottom: 'none',
                display: 'flex',
                height: 20,
                gap: 1,
                px: 1,
                py: 0,
                width: '100%',
              }}
            >
              <MuiRating
                precision={0.5}
                readOnly
                size="small"
                value={rating.score}
              />
            </TableCell>
          </RatingTableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default RatingTable
