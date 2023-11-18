import { Close as CloseIcon } from '@mui/icons-material'
import { IconButton, Tab, Tabs } from '@mui/material'
import { MouseEvent, SyntheticEvent, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  changeTab,
  closeTab,
  selectGetCurrentHistory,
  selectTabIndex,
  selectTabs,
} from '~/store/window'

const TabBar = () => {
  const getCurrentHistory = useAppSelector(selectGetCurrentHistory)
  const tabs = useAppSelector(selectTabs)
  const tabIndex = useAppSelector(selectTabIndex)
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
              label={getCurrentHistory(i).title}
              sx={{
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                fontSize: '0.75rem',
                minHeight: 0,
                pl: 1.5,
                pr: 0.5,
                py: 0.5,
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
