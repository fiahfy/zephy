import { Box, alpha } from '@mui/system'
import clsx from 'clsx'
import useExplorerItem from '~/hooks/useExplorerItem'
import { Content } from '~/interfaces'

type Props = {
  children: React.ReactNode
  content: Content
  tabIndex: number
}

const ExplorerTableRow = (props: Props) => {
  const { children, content, tabIndex } = props

  const { focused, onClick, onContextMenu, onDoubleClick, selected } =
    useExplorerItem(tabIndex, content)

  return (
    <Box
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
