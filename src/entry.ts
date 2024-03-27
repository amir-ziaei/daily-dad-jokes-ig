import './env'
import { router } from './routes'

const { port } = Bun.serve({
  port: process.env.PORT || 3000,
  development: process.env.NODE_ENV !== 'production',
  fetch(req) {
    return router.match(req)
  },
  error(error) {
    return router.handleError(error)
  },
})

console.log(`Server is up and running on port ${port}`)
