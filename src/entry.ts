import { join } from 'node:path'
import { sendDirectToThread } from './modules/instagram'
import { getRandomDadJoke } from './modules/jokes'
import './env'

const threadId = process.env.IG_THREAD_ID

try {
  const message = `Here's today's dad joke for you: ${await getRandomDadJoke()}`
  console.log(`About to send message "${message}" to thread id "${threadId}"`)
  await sendDirectToThread({
    message,
    threadId,
    authStatePath: await resolveAuthStatePath(),
  })
  console.log('Message sent successfully.')
} catch (error) {
  console.error(
    `Something went wrong. The error message: ${
      error instanceof Error ? error.message : error
    }.`,
  )
  throw error
}

async function resolveAuthStatePath() {
  async function touchNewFile(path: string) {
    return Bun.write(path, JSON.stringify({ cookies: [] }, null, 2))
  }
  const { AUTH_STATE_PATH } = process.env
  if (AUTH_STATE_PATH) {
    const exists = await Bun.file(AUTH_STATE_PATH).exists()
    if (!exists) {
      await touchNewFile(AUTH_STATE_PATH)
    }
    return AUTH_STATE_PATH
  }
  const path = join(import.meta.dir, '../mnt/auth.json')
  const exists = await Bun.file(path).exists()
  if (!exists) {
    await touchNewFile(path)
  }
  return path
}
