import { router } from './routes'
import './env'

const { port } = Bun.serve({
  port: process.env.PORT,
  development: process.env.NODE_ENV !== 'production',
  fetch(req) {
    return router.match(req)
  },
  error(error) {
    return router.handleError(error)
  },
})

console.log(`Server is up and running on port ${port}`)
