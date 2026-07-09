import { test, expect } from '@playwright/test'
import { clearSession } from './helpers/guest'

test.describe('Web guest experience (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await clearSession(page)
  })

  test('guest home shows public browse, not stories or social feed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Discover events' })).toBeVisible()
    await expect(page.getByText('Trending near you')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sign in for your personalized feed' })).toBeVisible()

    await expect(page.getByLabel('Add story')).toHaveCount(0)
    await expect(page.getByText("You're all caught up")).toHaveCount(0)
  })

  test('mobile app promo is visible for guests', async ({ page }) => {
    await expect(page.getByText('Get the Event app').first()).toBeVisible()
    await expect(page.getByLabel('Download on the App Store').first()).toBeVisible()
    await expect(page.getByLabel('Get it on Google Play').first()).toBeVisible()
  })

  test('guest cannot access notifications directly', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('public navigation links work', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Explore' }).click()
    await expect(page).toHaveURL(/\/explorer/)
    await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible()

    await page.getByRole('navigation').getByRole('link', { name: 'People' }).click()
    await expect(page).toHaveURL(/\/find-people/)
    await expect(page.getByRole('heading', { name: 'Find People' })).toBeVisible()

    await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL(/\/feed/)
  })

  test('guest can browse event and planner pages', async ({ page }) => {
    await page.goto('/explorer')
    const eventCard = page.locator('.web-event-grid [role="link"]').first()
    await eventCard.waitFor({ state: 'visible', timeout: 15_000 })
    await eventCard.click()
    await expect(page).toHaveURL(/\/event/)

    await page.goto('/page/neoncollective')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
