import { load } from 'exifreader'
import { readFile } from 'fs-extra'

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
