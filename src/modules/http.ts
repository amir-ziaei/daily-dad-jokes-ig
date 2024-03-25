import type { ErrorLike } from 'bun'

const HttpMethods = {
  GET: 'GET',
  HEAD: 'HEAD',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  CONNECT: 'CONNECT',
  OPTIONS: 'OPTIONS',
  TRACE: 'TRACE',
  PATCH: 'PATCH',
} as const
type HttpMethods = keyof typeof HttpMethods

type RoutePath = string
type RouteHandler = (req: Request) => Response | Promise<Response>
type ErrorHandler = (err: ErrorLike) => Response | Promise<Response>

export class Router {
  #routes: Record<HttpMethods, Map<RoutePath, RouteHandler>> = {
    GET: new Map<RoutePath, RouteHandler>(),
    HEAD: new Map<RoutePath, RouteHandler>(),
    POST: new Map<RoutePath, RouteHandler>(),
    PUT: new Map<RoutePath, RouteHandler>(),
    DELETE: new Map<RoutePath, RouteHandler>(),
    CONNECT: new Map<RoutePath, RouteHandler>(),
    OPTIONS: new Map<RoutePath, RouteHandler>(),
    TRACE: new Map<RoutePath, RouteHandler>(),
    PATCH: new Map<RoutePath, RouteHandler>(),
  }
  #defaultHandler: RouteHandler | undefined
  #catchHandler: ErrorHandler | undefined

  get(path: RoutePath, handler: RouteHandler) {
    this.#routes.GET.set(path, handler)
  }
  post(path: RoutePath, handler: RouteHandler) {
    this.#routes.POST.set(path, handler)
  }

  default(handler: RouteHandler) {
    this.#defaultHandler = handler
  }

  catch(handler: ErrorHandler) {
    this.#catchHandler = handler
  }

  #isValidHttpMethod(str: string): str is HttpMethods {
    return str in HttpMethods
  }

  match(req: Request) {
    const { pathname } = new URL(req.url)
    const method = req.method.toUpperCase()
    console.log('Incoming request:', `${method} ${pathname}`)
    if (!this.#isValidHttpMethod(method)) {
      // this shouldn't happen but safeguarding for TS
      throw new Error('Invalid Http Method')
    }
    const handler = this.#routes[method].get(pathname)
    if (handler) {
      return handler(req)
    }
    if (this.#defaultHandler) {
      return this.#defaultHandler(req)
    }
    throw new Error('No route match')
  }

  handleError(err: ErrorLike) {
    return this.#catchHandler?.(err)
  }
}
