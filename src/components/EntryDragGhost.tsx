import { Badge, Box, Typography } from '@mui/material'
import EntryIcon from '~/components/EntryIcon'
import type { Entry } from '~/interfaces'

type Props = {
  entries: Entry[]
}

const EntryDragGhost = (props: Props) => {
  const { entries } = props

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <Badge
        badgeContent={entries.length}
        color="primary"
        invisible={entries.length <= 1}
        sx={(theme) => ({
          left: theme.spacing(2),
          position: 'absolute',
          top: theme.spacing(2),
        })}
      />
      {entries.map((entry) => (
        <Box
          sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}
          key={entry.path}
        >
          <EntryIcon entry={entry} />
          <Typography noWrap variant="caption">
            {entry.name}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default EntryDragGhost
