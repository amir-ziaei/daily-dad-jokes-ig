import { test, expect } from '@playwright/test'

test('GET /', async ({ request }) => {
  const req = await request.get('/')
  expect(req.ok()).toBeFalsy()
  expect(req.status()).toBe(404)
  expect(await req.text()).toContain('404')
})

test('GET /healthcheck', async ({ request }) => {
  const req = await request.get('/healthcheck')
  expect(req.ok()).toBeTruthy()
  expect(req.status()).toBe(200)
  expect(await req.text()).toMatch(/ok/i)
})

test.describe('POST /jokes', () => {
  test('unauthenticated', async ({ request }) => {
    const req = await request.post('/jokes')
    expect(req.ok()).toBeFalsy()
    expect(req.status()).toBe(401)
    expect(await req.text()).toMatch(/unauthorized/i)
  })

  test('authenticated', async ({ request, page }) => {
    const req = await request.post('/jokes', {
      headers: { Authorization: process.env.AUTH_TOKEN },
    })
    expect(req.ok()).toBeTruthy()
    expect(req.status()).toBe(200)
    const response = await req.json()
    expect(response).toHaveProperty('message')

    await page.goto(
      `https://www.instagram.com/direct/t/${process.env.IG_THREAD_ID}/`,
    )
    await expect(
      page.getByLabel('Messages in conversation with'),
    ).toContainText(response.message)
  })
})
