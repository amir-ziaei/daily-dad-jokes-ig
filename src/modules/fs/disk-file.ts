import path from 'node:path'
import fs from 'node:fs/promises'

export class DiskFile {
  #path: string
  #unsavedContent: string | undefined

  constructor(path: string) {
    this.#path = path
  }

  exists() {
    return fs.exists(this.#path)
  }

  async fullPath() {
    const exists = await this.exists()
    if (!exists) {
      throw new Error(
        `File (${this.#path}) does not exist on the disk. Try saving it first.`,
      )
    }
    return path.resolve(process.cwd(), this.#path)
  }

  json() {
    return fs.readFile(this.#path, 'utf-8').then(JSON.parse)
  }

  /** Clears the previous content of the file */
  write(content: string) {
    this.#unsavedContent = content
    return this
  }

  async save() {
    if (!this.#unsavedContent) {
      return this
    }
    await fs.mkdir(path.dirname(this.#path), { recursive: true })
    await fs.writeFile(this.#path, this.#unsavedContent)
    this.#unsavedContent = undefined
    return this
  }
}
