import type { Page } from '@playwright/test'

export async function clearSession(page: Page) {
  await page.goto('/feed')
  await page.evaluate(() => {
    sessionStorage.clear()
    localStorage.clear()
  })
  await page.reload()
}
