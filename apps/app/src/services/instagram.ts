import { expect, type Locator, type Page } from '@playwright/test'
import { chromium } from 'playwright'

export type SendDirectToThreadParams = {
  message: string
  threadId: string
  authStatePath: string
  failureTraceSavePath: string
}

function logger() {
  const prefix = 'sendDirectToThread'
  return {
    log(...args: Parameters<typeof console.log>) {
      console.log(`${prefix}:`, ...args)
    },
    error(...args: Parameters<typeof console.error>) {
      console.error(`${prefix}:`, ...args)
    },
  }
}

const { log, error } = logger()

export async function sendDirectToThread({
  message,
  threadId,
  authStatePath,
  failureTraceSavePath,
}: SendDirectToThreadParams) {
  let browser, context
  try {
    browser = await chromium.launch({ headless: true })
    log('Chromium launched')

    context = await browser.newContext({
      storageState: authStatePath,
      locale: 'en-US',
      timezoneId: 'Europe/Vilnius',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    })
    log('Browser context created')

    await context.tracing.start({ screenshots: true, snapshots: true })
    log('Tracing started')

    const page = await context.newPage()
    log('New browser page opened')

    const threadUrl = `https://www.instagram.com/direct/t/${threadId}/`
    await page.goto(threadUrl)
    log(`Gone to the chat page: ${threadUrl}`)

    const pageUrl = page.url()
    log(`Current loaded page:: ${pageUrl}`)

    const isAuthenticated = pageUrl === threadUrl
    log(`Authentication status: ${isAuthenticated}`)

    if (!isAuthenticated) {
      log('Logging in...')
      await login(page)
      log('Logged in successfully')
      await context.storageState({ path: authStatePath })
      log('Auth state saved')
    }

    if (await isElementVisible(page.getByText('Turn on Notifications'))) {
      log(`Presented with the notifications preferences modal`)
      await page.getByRole('button', { name: 'Not Now' }).click()
      log('Turned off notifications')
    }

    if (page.url() !== threadUrl) {
      console.log(
        'Does not seem to be on the chat page, navigating there now...',
      )
      await page.goto(threadUrl)
      log('Chat opened')
    }

    await page.getByRole('paragraph').fill(message)
    log('Message filled')

    await wait(500)
    await page.getByRole('button', { name: /send/i }).click()
    log('Send button pressed')

    await wait(1000)
    await expect(page.getByRole('paragraph')).toHaveText('')
    await expect(
      page.getByLabel('Messages in conversation with'),
    ).toContainText(message)
    log('Message sent successfully')
  } catch (err) {
    error('an error occurred', err)
    if (context) {
      await context.tracing.stop({ path: failureTraceSavePath })
      log(`Trace saved at: ${failureTraceSavePath}`)
    }
    throw err
  } finally {
    if (browser) {
      await browser.close()
      log('Browser closed')
    }
  }
}

async function login(page: Page) {
  if (await isElementVisible(page.getByText('Allow the use of cookies from'))) {
    log(`Presented with the cookie preferences modal`)
    await page.getByRole('button', { name: 'Decline optional cookies' }).click()
    log('Declined cookies')
  }

  const continueAsBtn = page.getByRole('button', {
    name: `Continue as ${process.env.IG_USERNAME}`,
  })
  const usernameTextField = page.getByLabel('Phone number, username, or')

  const [isContinueAsBtnVisible, isUsernameTextFieldVisible] =
    await Promise.all([
      isElementVisible(continueAsBtn),
      isElementVisible(usernameTextField),
    ])
  log(`Continue as button visible: ${isContinueAsBtnVisible}`)
  log(`Username field visible: ${isUsernameTextFieldVisible}`)

  const status = isContinueAsBtnVisible
    ? 'AUTH_RECOVERABLE'
    : isUsernameTextFieldVisible
      ? 'AUTH_REQUIRED'
      : 'UNKNOWN'
  log(`Auth status: ${status}`)

  switch (status) {
    case 'AUTH_RECOVERABLE': {
      log(`Continuing as ${process.env.IG_USERNAME}`)
      await continueAsBtn.click()
      log(`Pressed continued as ${process.env.IG_USERNAME}`)
      break
    }
    case 'AUTH_REQUIRED': {
      await usernameTextField.fill(process.env.IG_USERNAME)
      log('Entered username')
      await page.getByLabel('Password').fill(process.env.IG_PASSWORD)
      log('Entered password')
      await page.getByRole('button', { name: 'Log in', exact: true }).click()
      log('Pressed the Log in button')
      break
    }
    case 'UNKNOWN':
    default: {
      throw new Error(
        'Encountered an unfamiliar situation and auth flow cannot continue.',
      )
    }
  }

  const isLoggedIn = await isElementVisible(
    page.getByRole('link', { name: 'Home Home' }),
  )
  if (!isLoggedIn) {
    error('Could not find the Home link. Auth has appeared to failed')
    throw new Error('Auth failed')
  }

  if (await isElementVisible(page.getByText('Save your login info?'))) {
    await page.getByRole('button', { name: 'Save info' }).click()
    log('Saved login info')
  }

  return page.waitForURL('**/?__coig_login=1')
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function isElementVisible(
  locator: Locator,
  { timeout }: { timeout?: number } = { timeout: 5_000 },
) {
  try {
    await locator.waitFor({ timeout: timeout })
    if (await locator.isVisible()) {
      return true
    }
    return false
  } catch {
    return false
  }
}
