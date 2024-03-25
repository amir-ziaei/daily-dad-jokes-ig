import { join } from 'node:path'

let cachedAuthStatePath = ''
export async function resolveAuthStatePath() {
  if (!cachedAuthStatePath) {
    cachedAuthStatePath = await run()
  }
  return cachedAuthStatePath
  async function run() {
    async function touchNewFile(path: string) {
      return Bun.write(path, JSON.stringify({ cookies: [] }, null, 2))
    }
    const { AUTH_STATE_PATH } = process.env
    if (AUTH_STATE_PATH) {
      const exists = await Bun.file(AUTH_STATE_PATH).exists()
      if (!exists) {
        await touchNewFile(AUTH_STATE_PATH)
      }
      return AUTH_STATE_PATH
    }
    const path = join(import.meta.dir, '../mnt/auth.json')
    const exists = await Bun.file(path).exists()
    if (!exists) {
      await touchNewFile(path)
    }
    return path
  }
}
