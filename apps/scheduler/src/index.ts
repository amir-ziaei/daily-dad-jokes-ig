export interface Env {
  BASE_URL: string
  API_TOKEN: string
}

export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const resp = await fetch(`${env.BASE_URL}/jokes`, {
      method: 'POST',
      headers: { Authorization: env.API_TOKEN },
    })
    const wasSuccessful = resp.ok ? 'success' : 'fail'
    console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`)
  },
}
