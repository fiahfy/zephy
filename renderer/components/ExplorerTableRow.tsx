import { Box, alpha } from '@mui/system'
import clsx from 'clsx'
import { MouseEvent } from 'react'

type Props = {
  'aria-rowindex': number
  children: React.ReactNode
  focused: boolean
  selected: boolean
  onClick: (e: MouseEvent) => void
  onContextMenu: (e: MouseEvent) => void
  onDoubleClick: (e: MouseEvent) => void
}

const ExplorerTableRow = (props: Props) => {
  const { children, focused, selected, onClick, onContextMenu, onDoubleClick } =
    props
  return (
    <Box
      aria-rowindex={props['aria-rowindex']}
      className={clsx({
        focused,
        selected,
      })}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.action.hover,
        },
        '&.selected': {
          backgroundColor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity,
            ),
          '&:hover': {
            backgroundColor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity +
                  theme.palette.action.hoverOpacity,
              ),
          },
        },
      }}
    >
      {children}
    </Box>
  )
}

export default ExplorerTableRow
