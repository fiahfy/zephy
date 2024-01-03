import { Close as CloseIcon } from '@mui/icons-material'
import { Box, IconButton, Tab, Typography } from '@mui/material'
import { MouseEvent, useCallback } from 'react'
import Icon from '~/components/Icon'
import useDropEntry from '~/hooks/useDropEntry'
import { useAppDispatch, useAppSelector } from '~/store'
import { closeTab, selectGetHistory } from '~/store/window'
import { getIconType } from '~/utils/url'

type Props = {
  index: number
}

const TabBarItem = (props: Props) => {
  const { index, ...others } = props

  const history = useAppSelector(selectGetHistory)(index)
  const dispatch = useAppDispatch()

  const { droppableStyle, ...dropHandlers } = useDropEntry({
    name: '',
    path: history.directoryPath,
    type: 'directory',
    url: '',
  })

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // prevent tab change event
      e.stopPropagation()
      dispatch(closeTab(index))
    },
    [dispatch, index],
  )

  return (
    <Tab
      // @see https://github.com/mui/material-ui/issues/27947#issuecomment-905318861
      {...others}
      disableRipple
      icon={
        <IconButton
          component="span"
          onClick={handleClick}
          size="small"
          sx={{ opacity: 0 }}
          title="Close"
        >
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      }
      iconPosition="end"
      label={
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            gap: 0.5,
            minWidth: 0,
          }}
        >
          <Icon iconType={getIconType(history.directoryPath)} />
          <Typography noWrap title={history.title} variant="caption">
            {history.title}
          </Typography>
        </Box>
      }
      sx={{
        color: (theme) => theme.palette.text.primary,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        minHeight: 0,
        pl: 1.0,
        pr: 0.5,
        py: 0.375,
        textTransform: 'none',
        '&.Mui-selected': {
          backgroundColor: (theme) => theme.palette.background.default,
        },
        '&.Mui-selected, &:hover': {
          '.MuiIconButton-root': {
            opacity: 1,
          },
        },
        ...droppableStyle,
      }}
      {...dropHandlers}
    />
  )
}

export default TabBarItem
