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
  const browser = await chromium.launch({ headless: true })
  console.log('sendDirectToThread: Chromium launched')
  const context = await browser.newContext({ storageState: authStatePath })
  const page = await context.newPage()
  const threadUrl = `https://www.instagram.com/direct/t/${threadId}/`
  await page.goto(threadUrl)
  const pageUrl = page.url()
  console.log(`sendDirectToThread: Instagram launched:: ${pageUrl}`)
  const isAuthenticated = pageUrl === threadUrl
  console.log(`sendDirectToThread: Authentication status: ${isAuthenticated}`)
  if (!isAuthenticated) {
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
  await page.getByRole('paragraph').fill(message)
  console.log('sendDirectToThread: Message filled')
  await page.getByRole('button', { name: /send/i }).click()
  console.log('sendDirectToThread: Send button pressed')
  await expect(page.getByRole('paragraph')).toHaveText('')
  await expect(page.getByLabel('Messages in conversation with')).toContainText(
    message,
  )
  console.log('sendDirectToThread: Message sent successfully')
  await browser.close()
}
