import { test as setup, expect } from '@playwright/test'

const authFile = 'mnt/auth.json'

setup('authenticate instagram', async ({ page }) => {
  await page.goto('https://www.instagram.com/')
  try {
    await page.getByRole('button', { name: 'Decline optional cookies' }).click()
  } catch {
    /** no need to handle */
  }
  await page
    .getByLabel('Phone number, username, or')
    .fill(process.env.IG_USERNAME)
  await page.getByLabel('Password').fill(process.env.IG_PASSWORD)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await page.getByRole('button', { name: 'Save info' }).click()
  try {
    await expect(page.getByText('Turn on Notifications')).toBeVisible()
    await page.getByRole('button', { name: 'Not Now' }).click()
  } catch {
    /** no need to handle */
  }
  await expect(page.getByRole('link', { name: 'Home Home' })).toBeVisible()
  await page.context().storageState({ path: authFile })
})
