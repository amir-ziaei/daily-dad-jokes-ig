import { DiskFile } from '../fs/disk-file'
import { PersistedVolumeFilePath } from './../fs/persisted-volume-file-path'

export type RateLimiterConfiguration = {
  /** time window in ms */
  timeWindow: number
  /** how many requests are allow within `timeWindow` */
  reqPerTimeWindow: number
}
type ExpirationTimestamp = number

export class RateLimiter {
  #cfg: RateLimiterConfiguration

  constructor(cfg: RateLimiterConfiguration) {
    this.#cfg = cfg
  }

  async #updateState(
    cb: (currentState: ExpirationTimestamp[]) => ExpirationTimestamp[],
  ) {
    const file = new DiskFile(
      new PersistedVolumeFilePath('rate-limiter-state.json').fullPath(),
    )
    const exists = await file.exists()
    if (!exists) {
      await file.write(JSON.stringify([])).save()
    }
    const currentState = await file.json()
    const newState = cb(currentState)
    await file.write(JSON.stringify(newState)).save()
  }

  async validate() {
    const { reqPerTimeWindow, timeWindow } = this.#cfg

    await this.#updateState(currentState => {
      const unexpiredItems = currentState.filter(
        expTime => expTime >= Date.now(),
      )
      if (unexpiredItems.length < reqPerTimeWindow) {
        return [...unexpiredItems, Date.now() + timeWindow]
      }
      throw new TooManyRequests()
    })
  }
}

export class TooManyRequests extends Error {
  constructor() {
    super('Rate limited')
  }

  toResponse() {
    return new Response('Too many requests', {
      status: 429,
    })
  }

  log() {
    console.log('🟡 Rate limited request')
  }
}
