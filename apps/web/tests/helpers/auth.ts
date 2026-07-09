import { expect, type Page } from '@playwright/test'

export async function completeOnboarding(page: Page) {
  await expect(page.getByRole('heading', { name: 'Welcome aboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page).toHaveURL(/\/feed/)
}

export async function login(page: Page, code = '123456') {
  await page.goto('/auth')
  await page.getByPlaceholder('Email or mobile number').fill('demo@test.com')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Enter your code')).toBeVisible()
  for (let i = 0; i < code.length; i += 1) {
    await page.getByLabel(`Digit ${i + 1}`).fill(code[i]!)
  }
  await expect(page).toHaveURL(/\/onboarding/)
  await completeOnboarding(page)
}
