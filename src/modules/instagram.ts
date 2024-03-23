import { expect } from '@playwright/test'
import { chromium } from 'playwright'

export type SendDirectToThreadParams = {
  message: string
  threadId: string
  authStatePath: string
}

export async function sendDirectToThread({
  message,
  threadId,
  authStatePath,
}: SendDirectToThreadParams) {
  const browser = await chromium.launch({ headless: false })
  console.log('sendDirectToThread: Chromium launched')
  const context = await browser.newContext({
    storageState: authStatePath,
    locale: 'en-US',
    timezoneId: 'Europe/Vilnius',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  })
  console.log('sendDirectToThread: Context created')
  const page = await context.newPage()
  console.log('sendDirectToThread: New page opened')
  const threadUrl = `https://www.instagram.com/direct/t/${threadId}/`
  await page.goto(threadUrl)
  console.log('sendDirectToThread: Went to thread url')
  const pageUrl = page.url()
  console.log(`sendDirectToThread: Instagram launched:: ${pageUrl}`)
  const isAuthenticated = pageUrl === threadUrl
  console.log(`sendDirectToThread: Authentication status: ${isAuthenticated}`)
  if (!isAuthenticated) {
    try {
      await page
        .getByRole('button', { name: `Continue as ${process.env.IG_USERNAME}` })
        .click()
      console.log(`sendDirectToThread: Continued as ${process.env.IG_USERNAME}`)
    } catch {}
    try {
      await page
        .getByRole('button', { name: 'Decline optional cookies' })
        .click()
      console.log('sendDirectToThread: Decline optional cookies')
    } catch {}
    await page
      .getByLabel('Phone number, username, or')
      .fill(process.env.IG_USERNAME)
    await page.getByLabel('Password').fill(process.env.IG_PASSWORD)
    console.log('sendDirectToThread: Entered credentials')
    await page.getByRole('button', { name: 'Log in', exact: true }).click()
    console.log('sendDirectToThread: Logged in')
    await page.getByRole('button', { name: 'Save info' }).click()
    console.log('sendDirectToThread: Saved info')
    try {
      await expect(page.getByText('Turn on Notifications')).toBeVisible()
      await page.getByRole('button', { name: 'Not Now' }).click()
      console.log('sendDirectToThread: Turned off notifications')
    } catch {}
    await context.storageState({ path: authStatePath })
    console.log('sendDirectToThread: Auth state saved')
  }
  if (page.url() !== threadUrl) {
    await page.goto(threadUrl)
    console.log('sendDirectToThread: Thread opened')
  }
  await page.getByRole('paragraph').fill(message)
  console.log('sendDirectToThread: Message filled')
  await new Promise(resolve => setTimeout(resolve, 1_000))
  await page.getByRole('button', { name: /send/i }).click()
  console.log('sendDirectToThread: Send button pressed')
  await new Promise(resolve => setTimeout(resolve, 2_000))
  await expect(page.getByRole('paragraph')).toHaveText('')
  await expect(page.getByLabel('Messages in conversation with')).toContainText(
    message,
  )
  console.log('sendDirectToThread: Message sent successfully')
  await browser.close()
  console.log('sendDirectToThread: Browser closed')
}
