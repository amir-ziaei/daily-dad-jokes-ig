import { DiskFile } from '../modules/fs/disk-file'
import { PersistedVolumeFilePath } from '../modules/fs/persisted-volume-file-path'
import type { RouteHandler } from '../modules/http/http-router'
import { sendDirectToThread } from '../services/instagram'
import { getRandomDadJoke } from '../services/jokes'

const threadId = process.env.IG_THREAD_ID

export const post: RouteHandler = async () => {
  try {
    const message = `Here's today's dad joke for you: ${await getRandomDadJoke()}`
    console.log(`About to send message "${message}" to thread id "${threadId}"`)
    await sendDirectToThread({
      message,
      threadId,
      authStatePath: await resolveAuthStatePath(),
    })
    return new Response('Message sent successfully')
  } catch (error) {
    console.error(
      `Something went wrong. The error message: ${
        error instanceof Error ? error.message : error
      }.`,
    )
    throw error
  }
}

async function resolveAuthStatePath() {
  const file = new DiskFile(new PersistedVolumeFilePath('auth.json').fullPath())
  const exists = await file.exists()
  if (!exists) {
    console.log("FIle doesn't exists, let's create it")
    await file.write(JSON.stringify({ cookies: [] })).save()
  }
  return file.fullPath()
}
