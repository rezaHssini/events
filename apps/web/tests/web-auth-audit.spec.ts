import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

const PUBLIC_ROUTES = ['/feed', '/explorer', '/find-people', '/event', '/page/neoncollective', '/user/alexm']

const AUTH_ROUTES = [
  '/my-events',
  '/planner',
  '/messages',
  '/notifications',
  '/profile',
  '/settings',
  '/create-event',
]

test.describe('Web authenticated experience (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('top nav and home feed use web layout', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Explore' })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'My Events' })).toBeVisible()
  })

  test('messages uses split-pane layout on desktop', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible()
    await expect(page.getByText('Select a conversation')).toBeVisible()
  })

  test('settings uses web page header', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText('Account, privacy, notifications & preferences')).toBeVisible()
  })

  test('footer promotes mobile apps', async ({ page }) => {
    await page.goto('/feed')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Stories, tickets & live updates — on your phone').last()).toBeVisible()
  })

  test('all primary routes render without crash', async ({ page }) => {
    for (const route of [...PUBLIC_ROUTES, ...AUTH_ROUTES]) {
      await page.goto(route)
      await expect(page.locator('body')).not.toBeEmpty()
      await expect(page.getByRole('banner').first()).toBeVisible()
    }
  })
})
