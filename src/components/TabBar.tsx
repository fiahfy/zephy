import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import { Tabs } from '@mui/material'
import { useCallback, useMemo } from 'react'
import TabBarAddItem from '~/components/TabBarAddItem'
import TabBarItem from '~/components/TabBarItem'
import { useAppDispatch, useAppSelector } from '~/store'
import { moveTab, selectCurrentTabId, selectTabs } from '~/store/window'

const TabBar = () => {
  const tabId = useAppSelector(selectCurrentTabId)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
  )

  const tabIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === tabId),
    [tabId, tabs],
  )

  const items = useMemo(() => tabs.map((tab) => tab.id), [tabs])

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e
      const activeId = active.id
      const overId = over?.id
      if (
        typeof activeId === 'number' &&
        typeof overId === 'number' &&
        activeId !== overId
      ) {
        dispatch(moveTab(activeId, overId))
      }
    },
    [dispatch],
  )

  return (
    <>
      {tabs.length > 1 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
          sensors={sensors}
        >
          <SortableContext
            items={items}
            strategy={horizontalListSortingStrategy}
          >
            <Tabs
              scrollButtons="auto"
              sx={{
                flexShrink: 0,
                minHeight: 0,
                position: 'relative',
                '&::before': {
                  borderBottom: (theme) =>
                    `thin solid ${theme.palette.divider}`,
                  content: '""',
                  inset: 'auto 0 0',
                  position: 'absolute',
                },
                '.MuiTabs-indicator': {
                  display: 'none',
                },
                '.MuiTabs-scrollButtons.Mui-disabled': {
                  opacity: 0.3,
                },
              }}
              value={tabIndex}
              variant="scrollable"
            >
              {items.map((id) => {
                const tab = tabs.find((tab) => tab.id === id)
                return tab ? <TabBarItem key={tab.id} tabId={tab.id} /> : null
              })}
              <TabBarAddItem />
            </Tabs>
          </SortableContext>
        </DndContext>
      )}
    </>
  )
}

export default TabBar
