import { UnauthorizedRequest } from '../exceptions/unauthorized-request'
import { sendDirectToThread } from '../modules/instagram'
import { getRandomDadJoke } from '../modules/jokes'
import { resolveAuthStatePath } from '../modules/path'

const threadId = process.env.IG_THREAD_ID

function requireAuthentication(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || authHeader !== process.env.AUTH_TOKEN) {
    throw new UnauthorizedRequest(req)
  }
}

export async function post(req: Request) {
  await requireAuthentication(req)
  try {
    const message = `Here's today's dad joke for you: ${await getRandomDadJoke()}`
    console.log(`About to send message "${message}" to thread id "${threadId}"`)
    sendDirectToThread({
      message,
      threadId,
      authStatePath: await resolveAuthStatePath(),
    })
    // console.log('Message sent successfully.')
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
