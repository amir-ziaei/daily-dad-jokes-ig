import  { type ErrorLike } from 'bun'
import {
  UnauthorizedRequest,
  requireAuthentication,
} from './modules/http/authentication'
import { RateLimiter, TooManyRequests } from './modules/http/http-rate-limiter'
import { Router } from './modules/http/http-router'
import * as healthcheckRoute from './routes/healthcheck'
import * as jokesRoute from './routes/jokes'

export const router = new Router()

const rateLimiter = new RateLimiter({
  timeWindow: 24 * 60 * 60 * 1000,
  reqPerTimeWindow:
    process.env.NODE_ENV === 'development' ? Number.MAX_SAFE_INTEGER : 3,
})

router.post('/jokes', async req => {
  await rateLimiter.validate()
  await requireAuthentication(req)
  return jokesRoute.post(req)
})

router.get('/healthcheck', healthcheckRoute.get)

router.catch((error: ErrorLike) => {
  if (
    error instanceof UnauthorizedRequest ||
    error instanceof TooManyRequests
  ) {
    error.log()
    return error.toResponse()
  }
  console.error('🔴 Uncaught error:', error, error.stack)
  return new Response('Something went wrong', { status: 500 })
})
