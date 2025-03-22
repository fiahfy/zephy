import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import type { Entry } from '~/interfaces'

const parseParameters = (parameters: string) => {
  const promptLabel = 'Prompt'
  const negativePromptLabel = 'Negative prompt'

  const lines = parameters.split('\n')

  const items = []

  let match: RegExpMatchArray | null = null

  const prompts: string[] = []
  while (true) {
    const line = lines.shift()
    if (!line) {
      break
    }
    match = line.match(/^([\w\s]+):(.*)$/)
    if (match) {
      break
    }
    prompts.push(line)
  }
  items.push({
    label: promptLabel,
    value: prompts.join('\n'),
  })
  if (!match) {
    return items
  }

  if (match[1] === negativePromptLabel) {
    const prompts: string[] = [match[2]]
    while (true) {
      const line = lines.shift()
      if (!line) {
        break
      }
      match = line.match(/^([\w\s]+):(.*)$/)
      if (match) {
        break
      }
      prompts.push(line)
    }
    items.push({
      label: negativePromptLabel,
      value: prompts.join('\n'),
    })
  }
  if (!match) {
    return items
  }

  const matches = Array.from(
    match[0].matchAll(/([\w\s]+): (?:(?:"([^"]+)")|([^",]+))/g),
  )
  for (const match of matches) {
    items.push({
      label: match[1],
      value: match[2] || match[3],
    })
  }

  return items
}

type Props = {
  entry: Entry
}

const EntryParametersTable = (props: Props) => {
  const { entry } = props

  const [parameters, setParameters] = useState<string>()

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      const parameters = await (async () => {
        try {
          return await window.electronAPI.getEntryParameters(entry.path)
        } catch (e) {
          return undefined
        }
      })()
      if (unmounted) {
        return
      }
      setParameters(parameters)
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path])

  const rows = useMemo(
    () => (parameters ? parseParameters(parameters) : []),
    [parameters],
  )

  return (
    <>
      {rows.length > 0 && (
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <caption style={{ captionSide: 'top', padding: 0 }}>
            <Typography
              component="p"
              sx={{
                color: (theme) => theme.palette.text.primary,
                fontWeight: 'bold',
                mb: 0,
                overflowWrap: 'break-word',
                pb: 0.5,
                px: 1,
              }}
              variant="caption"
            >
              Parameters
            </Typography>
          </caption>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell
                  component="th"
                  sx={{
                    borderBottom: 0,
                    height: 20,
                    px: 1,
                    py: 0,
                    width: 128,
                  }}
                >
                  <Typography
                    noWrap
                    sx={{ display: 'block' }}
                    variant="caption"
                  >
                    {row.label}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ borderBottom: 0, height: 20, px: 1, py: 0 }}
                >
                  <Typography
                    noWrap
                    sx={{
                      display: 'block',
                      userSelect: 'text',
                      whiteSpace: 'pre-wrap',
                    }}
                    variant="caption"
                  >
                    {row.value}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}

export default EntryParametersTable
