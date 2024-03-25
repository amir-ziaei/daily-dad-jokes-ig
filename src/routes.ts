import type { ErrorLike } from 'bun'
import { Router } from './modules/http'
import * as jokesRoute from './routes/jokes'
import * as healthcheckRoute from './routes/healthcheck'
import { UnauthorizedRequest } from './exceptions/unauthorized-request'

export const router = new Router()

router.get('/healthcheck', healthcheckRoute.get)
router.post('/jokes', jokesRoute.post)

router.default(() => {
  return new Response('404', {
    status: 404,
  })
})

router.catch((error: ErrorLike) => {
  if (error instanceof UnauthorizedRequest) {
    error.log()
    return error.toResponse()
  }
  console.error('🔴 Uncaught error:', error, error.stack)
  return new Response('Something went wrong', { status: 500 })
})
