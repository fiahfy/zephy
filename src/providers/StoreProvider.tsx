import { type ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, storageKey, store } from '~/store'
import { replaceState as replaceFavoriteState } from '~/store/favorite'
import { replaceState as replacePreferencesState } from '~/store/preferences'
import { replaceState as replaceQueryState } from '~/store/query'
import { replaceState as replaceRatingState } from '~/store/rating'
import { replaceState as replaceSettingsState } from '~/store/settings'
import { newWindow, replaceState as replaceWindowState } from '~/store/window'
import { setWindowId } from '~/store/window-id'

type Props = { children: ReactNode }

const StoreProvider = (props: Props) => {
  const { children } = props

  const { dispatch } = store

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }
      if (!e.newValue) {
        return
      }
      const newState = JSON.parse(e.newValue)
      dispatch(replaceFavoriteState({ state: JSON.parse(newState.favorite) }))
      dispatch(
        replacePreferencesState({ state: JSON.parse(newState.preferences) }),
      )
      dispatch(replaceQueryState({ state: JSON.parse(newState.query) }))
      dispatch(replaceRatingState({ state: JSON.parse(newState.rating) }))
      dispatch(replaceSettingsState({ state: JSON.parse(newState.settings) }))
      dispatch(replaceWindowState({ state: JSON.parse(newState.window) }))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const data = await window.electronAPI.restore()
      if (!data) {
        return
      }
      const { id, params } = data
      dispatch(setWindowId({ windowId: id }))
      const directoryPath = params?.directoryPath
      if (directoryPath) {
        dispatch(newWindow(directoryPath))
      }
      setInitialized(true)
    })()
  }, [dispatch])

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{initialized && children}</PersistGate>
    </Provider>
  )
}

export default StoreProvider
