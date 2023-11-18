import { ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, storageKey, store } from '~/store'
import { replace as replaceFavorite } from '~/store/favorite'
import { replace as replacePreview } from '~/store/preview'
import { replace as replaceQuery } from '~/store/query'
import { replace as replaceRating } from '~/store/rating'
import { replace as replaceSettings } from '~/store/settings'
import {
  changeDirectory,
  initialize,
  replace as replaceWindow,
} from '~/store/window'
import { set } from '~/store/windowIndex'

type Props = { children: ReactNode }

export const StoreProvider = (props: Props) => {
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
      dispatch(replaceFavorite(JSON.parse(newState.favorite)))
      dispatch(replacePreview(JSON.parse(newState.preview)))
      dispatch(replaceQuery(JSON.parse(newState.query)))
      dispatch(replaceRating(JSON.parse(newState.rating)))
      dispatch(replaceSettings(JSON.parse(newState.settings)))
      dispatch(replaceWindow(JSON.parse(newState.window)))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const data = await window.electronAPI.restoreWindow()
      if (!data) {
        return
      }
      const { index, params } = data
      dispatch(set(index))
      const directoryPath = params?.directoryPath
      if (directoryPath) {
        dispatch(initialize())
        dispatch(changeDirectory(directoryPath))
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
