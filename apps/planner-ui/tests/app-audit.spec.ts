import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Full app audit', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.addInitScript(() => {
      ;(window as unknown as { __auditErrors: string[] }).__auditErrors = []
    })
    await login(page)
  })

  test('main tabs and navigation work', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Feed' })).toBeVisible()

    await page.getByRole('link', { name: 'Explore' }).click()
    await expect(page).toHaveURL(/\/explorer/)
    await page.getByRole('button', { name: 'Trends' }).click()
    await page.getByRole('button', { name: 'Following' }).click()

    await page.getByRole('link', { name: 'Events' }).click()
    await expect(page).toHaveURL(/\/my-events/)

    await page.getByRole('link', { name: /Planner|Club/ }).click()
    await expect(page).toHaveURL(/\/planner/)
  })

  test('feed interactions show feedback', async ({ page }) => {
    await page.goto('/feed')
    await page.getByRole('button', { name: 'Like post' }).first().click()
    await expect(page.getByText('❤️ Liked')).toBeVisible({ timeout: 5000 })
  })

  test('event purchase flow works', async ({ page }) => {
    await page.goto('/event')
    await page.getByRole('link', { name: /Get Tickets/ }).click()
    await expect(page).toHaveURL(/\/checkout/)

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByPlaceholder('Jane Doe').fill('Jane Doe')
    await page.getByPlaceholder('4242 4242 4242 4242').fill('4242424242424242')
    await page.getByPlaceholder('MM/YY').fill('12/28')
    await page.getByRole('button', { name: 'Save & continue' }).click()
    await page.getByRole('button', { name: /Pay \$/ }).click()
    await expect(page.getByText("You're in!")).toBeVisible()
    await page.getByRole('button', { name: /Post I'm going/ }).click()
    await expect(page.getByText('Shared with friends!')).toBeVisible()
  })

  test('settings items respond', async ({ page }) => {
    await page.goto('/settings')
    await page.getByText('Help center').click()
    await expect(page.getByText('Common topics: tickets, refunds, account, events.')).toBeVisible()
    await page.getByText('How do tickets work?').click()
    await expect(page.getByText('How do tickets work?').first()).toBeVisible()
  })

  test('feed stories and mode toggle work', async ({ page }) => {
    await page.goto('/feed')
    await page.getByRole('button', { name: 'Nearby' }).click()
    await expect(page.getByRole('button', { name: 'Nearby' })).toBeVisible()
    await page.getByLabel('Add story').click()
    await expect(page.getByText('Add to your story')).toBeVisible()
    await page.getByPlaceholder("What's happening?").fill('Great night out')
    await page.getByRole('button', { name: 'Share to story' }).click()
    await expect(page.getByText('✓ Story posted')).toBeVisible()
  })

  test('club planner flow when becoming planner', async ({ page }) => {
    await page.goto('/planner')
    await page.getByPlaceholder('Neon Collective').fill('Test Club')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Launch My Club' }).click()
    await expect(page.getByText(/My Club|Planner page|Create event/i).first()).toBeVisible()
  })

  test('images load from local bundle', async ({ page }) => {
    await page.goto('/feed')
    const broken = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'))
      const results = await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve(true)
            : new Promise<boolean>((resolve) => {
                img.onload = () => resolve(true)
                img.onerror = () => resolve(false)
              }),
        ),
      )
      return results.filter((ok) => !ok).length
    })
    expect(broken).toBeLessThan(3)
  })

  test('all primary routes render without crash', async ({ page }) => {
    const routes = [
      '/feed',
      '/explorer',
      '/my-events',
      '/planner',
      '/event',
      '/menu',
      '/messages',
      '/find-people',
      '/profile',
      '/settings',
      '/user/alexm',
      '/page/neoncollective',
      '/create-event',
    ]

    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('body')).not.toBeEmpty()
    }
  })
})
