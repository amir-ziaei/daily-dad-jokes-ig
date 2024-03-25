import { router } from './routes'
import './env'

Bun.serve({
  development: process.env.NODE_ENV !== 'production',
  fetch(req) {
    return router.match(req)
  },
  error(error) {
    return router.handleError(error)
  },
})
