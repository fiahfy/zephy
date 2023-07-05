import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

import store, { storageKey } from 'store'
import { replace as replaceFavorite } from 'store/favorite'
import { replace as replaceQueryHistory } from 'store/queryHistory'
import { replace as replaceRating } from 'store/rating'
import { replace as replaceSettings } from 'store/settings'
import { replace as replaceWindow } from 'store/window'
import { initialize } from 'store/windowIndex'

type Props = { children: ReactNode }

export const StoreProvider = (props: Props) => {
  const { children } = props

  const persistor = persistStore(store)

  useEffect(() => {
    store.dispatch(initialize())

    const handler = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }
      if (!e.newValue) {
        return
      }
      const newState = JSON.parse(e.newValue)
      store.dispatch(replaceFavorite(JSON.parse(newState.favorite)))
      store.dispatch(replaceQueryHistory(JSON.parse(newState.queryHistory)))
      store.dispatch(replaceRating(JSON.parse(newState.rating)))
      store.dispatch(replaceSettings(JSON.parse(newState.settings)))
      store.dispatch(replaceWindow(JSON.parse(newState.window)))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{children}</PersistGate>
    </Provider>
  )
}
