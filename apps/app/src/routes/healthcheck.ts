import { type RouteHandler } from '../modules/http/http-router'

export const get: RouteHandler = async () => {
  return new Response('OK')
}
