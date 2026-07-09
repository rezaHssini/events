import { test, expect } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { login } from './helpers/auth'

async function openSeatingStudio(page: import('@playwright/test').Page) {
  await page.goto('/create-event')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Seated' }).click()
  await page.getByRole('button', { name: /Open seating studio/i }).click()
  await expect(page.getByTestId('seating-studio')).toBeVisible({ timeout: 8000 })
}

test('seating studio audit screenshots', async ({ page }) => {
  const out = path.join('test-results', 'seating-studio')
  fs.mkdirSync(out, { recursive: true })

  await login(page)
  await openSeatingStudio(page)

  await expect(page.getByText('Floor overview')).toBeVisible()

  await page.getByRole('button', { name: 'Detail', exact: true }).click()
  await expect(page.getByText('Tap seats on the map')).toBeVisible()
  await page.screenshot({ path: path.join(out, '01-theater-detail.png') })

  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await page.screenshot({ path: path.join(out, '02-theater-overview.png') })

  await page.getByRole('button', { name: 'Restaurant' }).click()
  await expect(page.getByText('Floor overview')).toBeVisible()
  await page.screenshot({ path: path.join(out, '03-restaurant-overview.png') })

  await page.getByLabel('Add floor').click()
  await expect(page.getByRole('button', { name: 'Mezzanine' })).toBeVisible()
  await page.screenshot({ path: path.join(out, '03-two-floors.png') })

  await page.getByLabel('Venue settings').click()
  await expect(page.getByRole('heading', { name: 'Venue & stage' })).toBeVisible()
  await page.screenshot({ path: path.join(out, '04-venue-sheet.png') })
})
