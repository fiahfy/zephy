import { Close as CloseIcon } from '@mui/icons-material'
import { Box, IconButton, Tab, Tabs, Typography } from '@mui/material'
import { MouseEvent, SyntheticEvent, useCallback } from 'react'
import Icon from '~/components/Icon'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  changeTab,
  closeTab,
  selectGetCurrentHistory,
  selectTabIndex,
  selectTabs,
} from '~/store/window'
import { getIconType } from '~/utils/url'

const TabBar = () => {
  const getCurrentHistory = useAppSelector(selectGetCurrentHistory)
  const tabIndex = useAppSelector(selectTabIndex)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const handleChange = useCallback(
    (_e: SyntheticEvent, value: number) => dispatch(changeTab(value)),
    [dispatch],
  )

  const handleClick = useCallback(
    (e: MouseEvent, tabIndex: number) => {
      e.stopPropagation()
      dispatch(closeTab(tabIndex))
    },
    [dispatch],
  )

  return (
    <>
      {tabs.length > 1 && (
        <Tabs
          onChange={handleChange}
          scrollButtons={false}
          sx={{
            flexShrink: 0,
            minHeight: 0,
            position: 'relative',
            '&::before': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              content: '""',
              inset: 'auto 0 0',
              position: 'absolute',
            },
            '.MuiTabs-indicator': {
              bottom: 'auto',
              top: 0,
              transition: 'none',
            },
          }}
          value={tabIndex}
          variant="scrollable"
        >
          {tabs.map((_, i) => (
            <Tab
              disableRipple
              icon={
                <IconButton
                  component="span"
                  onClick={(e) => handleClick(e, i)}
                  size="small"
                  sx={{ opacity: 0 }}
                  title="Close"
                >
                  <CloseIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              }
              iconPosition="end"
              key={i}
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
                  <Icon
                    iconType={getIconType(getCurrentHistory(i).directoryPath)}
                  />
                  <Typography
                    noWrap
                    title={getCurrentHistory(i).title}
                    variant="caption"
                  >
                    {getCurrentHistory(i).title}
                  </Typography>
                </Box>
              }
              sx={{
                color: (theme) => theme.palette.text.primary,
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                minHeight: 0,
                pl: 1.0,
                pr: 0.5,
                py: 0.25,
                textTransform: 'none',
                '&.Mui-selected': {
                  backgroundColor: (theme) => theme.palette.background.default,
                },
                '&.Mui-selected, &:hover': {
                  '.MuiIconButton-root': {
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Tabs>
      )}
    </>
  )
}

export default TabBar
