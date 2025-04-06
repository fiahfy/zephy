import {
  ViewCarousel as ViewCarouselIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { type MouseEvent, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectCurrentViewMode, setCurrentViewMode } from '~/store/window'

const ViewModeToggleButtonGroup = () => {
  const viewMode = useAppSelector(selectCurrentViewMode)
  const dispatch = useAppDispatch()

  const handleChange = useCallback(
    (_e: MouseEvent, value: 'list' | 'thumbnail' | 'gallery' | null) => {
      if (!value) {
        return
      }
      dispatch(setCurrentViewMode(value))
    },
    [dispatch],
  )

  return (
    <ToggleButtonGroup
      exclusive
      onChange={handleChange}
      size="small"
      sx={(theme) => ({
        gap: theme.spacing(0.5),
        '.MuiToggleButton-root': {
          border: 0,
          borderRadius: theme.spacing(0.5),
          m: 0,
          p: 0.5,
        },
      })}
      value={viewMode}
    >
      <ToggleButton color="primary" key="list" title="List" value="list">
        <ViewListIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton
        color="primary"
        key="thumbnail"
        title="Thumbnail"
        value="thumbnail"
      >
        <ViewModuleIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton
        color="primary"
        key="gallery"
        title="Gallery"
        value="gallery"
      >
        <ViewCarouselIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ViewModeToggleButtonGroup
