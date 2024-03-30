export function requireAuthentication(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || authHeader !== process.env.AUTH_TOKEN) {
    throw new UnauthorizedRequest(req)
  }
}

export class UnauthorizedRequest extends Error {
  #req: Request

  constructor(req: Request) {
    super('Unauthorized')
    this.#req = req
  }

  toResponse() {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  log() {
    console.log('🟡 Unauthorized request:', this.#req)
  }
}
