import { ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

import store, { storageKey } from 'store'
import { replace as replaceFavorite } from 'store/favorite'
import { replace as replaceQueryHistory } from 'store/queryHistory'
import { replace as replaceRating } from 'store/rating'
import { replace as replaceSettings } from 'store/settings'
import {
  changeDirectory,
  initialize,
  replace as replaceWindow,
} from 'store/window'
import { set } from 'store/windowIndex'

type Props = { children: ReactNode }

export const StoreProvider = (props: Props) => {
  const { children } = props

  const persistor = persistStore(store)

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
      dispatch(replaceFavorite(JSON.parse(newState.favorite)))
      dispatch(replaceQueryHistory(JSON.parse(newState.queryHistory)))
      dispatch(replaceRating(JSON.parse(newState.rating)))
      dispatch(replaceSettings(JSON.parse(newState.settings)))
      dispatch(replaceWindow(JSON.parse(newState.window)))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const details = await window.electronAPI.window.getDetails()
      if (!details) {
        return
      }
      const { index, params } = details
      dispatch(set(index))
      const directory = params?.directory
      if (directory) {
        dispatch(initialize({ index }))
        dispatch(changeDirectory(directory))
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
