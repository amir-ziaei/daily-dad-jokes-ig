import { test as setup, expect } from '@playwright/test'

const authFile = 'mnt/auth.json'

setup('authenticate instagram', async ({ page }) => {
  await page.goto('https://www.instagram.com/')
  const declineCookies = page.getByRole('button', {
    name: 'Decline optional cookies',
  })
  if (await declineCookies.isVisible()) {
    await declineCookies.click()
  }
  await page
    .getByLabel('Phone number, username, or')
    .fill(process.env.IG_USERNAME)
  await page.getByLabel('Password').fill(process.env.IG_PASSWORD)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  if (await page.getByText('Save your login info?').isVisible()) {
    await page.getByRole('button', { name: 'Save info' }).click()
  }
  if (await page.getByText('Turn on Notifications').isVisible()) {
    await page.getByRole('button', { name: 'Not Now' }).click()
  }
  await expect(page.getByRole('link', { name: 'Home Home' })).toBeVisible()
  await page.context().storageState({ path: authFile })
})
