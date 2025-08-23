import { readFile } from 'node:fs/promises'
import { load } from 'exifreader'

export const getEntryParameters = async (
  path: string,
): Promise<string | undefined> => {
  try {
    const fileBuffer = await readFile(path)
    const tags = await load(fileBuffer, {
      async: true,
    })
    return tags.parameters?.value
  } catch {
    return undefined
  }
}
