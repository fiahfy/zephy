import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import PreviewParametersTableCell from '~/components/PreviewParametersTableCell'
import PreviewParametersTableHeaderCell from '~/components/PreviewParametersTableHeaderCell'
import { useAppSelector } from '~/store'
import { selectPreviewContentPath } from '~/store/preview'

const parseParameters = (parameters: string) => {
  let prompt = ''
  let negativePrompt = ''
  const params = []

  const lines = parameters.split('\n')

  let match: RegExpMatchArray | null = null

  const prompts: string[] = []
  while (true) {
    const line = lines.shift()
    if (typeof line === 'undefined') {
      break
    }
    match = line.match(/^([\w\s]+): (.*)$/)
    if (match) {
      break
    }
    prompts.push(line)
  }
  prompt = prompts.join('\n')

  if (match && match[1] === 'Negative prompt') {
    const prompts: string[] = [match[2]]
    while (true) {
      const line = lines.shift()
      if (typeof line === 'undefined') {
        break
      }
      match = line.match(/^([\w\s]+): (.*)$/)
      if (match) {
        break
      }
      prompts.push(line)
    }
    negativePrompt = prompts.join('\n')
  }

  const matches = match
    ? Array.from(match[0].matchAll(/([\w\s]+): (?:(?:"([^"]+)")|([^",]+))/g))
    : []
  for (const match of matches) {
    params.push({
      label: match[1],
      value: match[2] || match[3],
    })
  }

  return { prompt, negativePrompt, params }
}

const PreviewParametersTable = () => {
  const path = useAppSelector(selectPreviewContentPath)

  const [parameters, setParameters] = useState<string>()

  const parsed = useMemo(
    () => (parameters ? parseParameters(parameters) : undefined),
    [parameters],
  )

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      if (!path) {
        return
      }
      const parameters = await window.entryAPI.getEntryParameters(path)
      if (unmounted) {
        return
      }
      setParameters(parameters)
    })()

    return () => {
      unmounted = true
    }
  }, [path])

  return (
    <>
      {parsed && (
        <Table
          size="small"
          sx={(theme) => ({
            tableLayout: 'fixed',
            'tbody + tbody::before': {
              content: '""',
              display: 'table-row',
              height: theme.spacing(0.5),
            },
          })}
        >
          <caption style={{ captionSide: 'top', padding: 0 }}>
            <Typography
              component="p"
              sx={(theme) => ({
                color: theme.palette.text.primary,
                fontWeight: 'bold',
                pb: 0.5,
                px: 1,
              })}
              variant="caption"
            >
              Parameters
            </Typography>
          </caption>
          {parsed.prompt && (
            <TableBody>
              <TableRow>
                <PreviewParametersTableHeaderCell label="Prompt" />
              </TableRow>
              <TableRow>
                <PreviewParametersTableCell label={parsed.prompt} />
              </TableRow>
            </TableBody>
          )}
          {parsed.negativePrompt && (
            <TableBody>
              <TableRow>
                <PreviewParametersTableHeaderCell label="Negative Prompt" />
              </TableRow>
              <TableRow>
                <PreviewParametersTableCell label={parsed.negativePrompt} />
              </TableRow>
            </TableBody>
          )}
          {parsed.params.length > 0 && (
            <TableBody>
              <TableRow>
                <PreviewParametersTableHeaderCell label="Params" />
              </TableRow>
              {parsed.params.map((param) => (
                <TableRow key={param.label}>
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
                      {param.label}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      borderBottom: 0,
                      height: 20,
                      px: 1,
                      py: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        display: 'block',
                        userSelect: 'text',
                        wordBreak: 'break-word',
                      }}
                      variant="caption"
                    >
                      {param.value}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      )}
    </>
  )
}

export default PreviewParametersTable
