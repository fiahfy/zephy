import { AppBar, Toolbar, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { useTitleBar } from 'contexts/TitleBarContext'
import { useAppSelector } from 'store'
import { selectCurrentDirectory, selectExplorable } from 'store/window'
import Head from 'next/head'

const TitleBar = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const explorable = useAppSelector(selectExplorable)

  const { visible } = useTitleBar()

  const [title, setTitle] = useState('')

  useEffect(() => {
    ;(async () => {
      if (explorable) {
        const basename = await window.electronAPI.basename(currentDirectory)
        setTitle(basename)
      } else {
        setTitle('Settings')
      }
    })()
  }, [currentDirectory, explorable])

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {visible && (
        <AppBar
          color="default"
          component="div"
          elevation={0}
          sx={{
            top: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              WebkitAppRegion: 'drag',
              justifyContent: 'center',
              minHeight: (theme) => `${theme.spacing(3.5)}!important`,
              padding: (theme) => `${theme.spacing(0.5)} ${theme.spacing(9)} 0`,
              userSelect: 'none',
            }}
          >
            <Typography align="center" noWrap variant="caption">
              Zephy
            </Typography>
          </Toolbar>
        </AppBar>
      )}
    </>
  )
}

export default TitleBar
