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
    console.log('🟡 Unauthorized request:', this.#req, this.stack)
  }
}
