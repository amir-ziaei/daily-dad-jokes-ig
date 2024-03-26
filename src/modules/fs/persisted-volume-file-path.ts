import path from 'node:path'

export class PersistedVolumeFilePath {
  #fileName: string

  constructor(fileName: string) {
    this.#fileName = fileName
  }

  fullPath() {
    const mountDir = process.env.PERSISTED_VOLUME_PATH ?? 'mnt'
    return path.resolve(process.cwd(), mountDir, this.#fileName)
  }
}
