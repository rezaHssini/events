import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

async function becomePlanner(page: import('@playwright/test').Page) {
  await login(page)
  await page.goto('/planner')
  const nameInput = page.getByPlaceholder('Neon Collective')
  await nameInput.fill('Audit Club')
  await expect(nameInput).toHaveValue('Audit Club')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Launch My Club' }).click()
  await expect(page.getByRole('link', { name: 'Create event' })).toBeVisible({ timeout: 10000 })
}

async function goToCreateEventMediaStep(page: import('@playwright/test').Page) {
  await becomePlanner(page)
  await page.goto('/create-event')
  for (let i = 0; i < 5; i += 1) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await expect(page.getByText('Media & lineup')).toBeVisible()
}

test.describe('Create event media & success pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('media step renders and gallery picker works', async ({ page }) => {
    await goToCreateEventMediaStep(page)

    await expect(page.getByText('Media & lineup')).toBeVisible()
    await expect(page.getByText('Gallery photos', { exact: true })).toBeVisible()
    await expect(page.getByText('Promo videos', { exact: true })).toBeVisible()
    await expect(page.getByText('Lineup / performers', { exact: true })).toBeVisible()

    const galleryAdd = page.getByLabel('Add gallery photo')
    await galleryAdd.click()
    await expect(page.getByText('Add gallery photo')).toBeVisible()
    await page.locator('.fixed.inset-0.z-\\[70\\] button').first().click()
    await page.getByRole('button', { name: 'Add performer' }).click()
    await expect(page.getByPlaceholder('Performer 4')).toBeVisible()

    const layout = await page.evaluate(() => {
      const mediaHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent?.includes('Media & lineup'),
      )
      const footer = document.querySelector('[data-testid="create-event-footer"]')
      return {
        hasMediaHeading: !!mediaHeading,
        footerButtonCount: footer?.querySelectorAll('button').length ?? 0,
      }
    })

    expect(layout.hasMediaHeading).toBe(true)
    expect(layout.footerButtonCount).toBeGreaterThanOrEqual(2)
  })

  test('success page after publish has proper layout', async ({ page }) => {
    await page.goto('/create-event')
    for (let i = 0; i < 7; i += 1) {
      await page.getByRole('button', { name: 'Continue' }).click()
    }
    await page.getByRole('button', { name: /Publish now Goes live/ }).click()
    await page.getByTestId('create-event-footer').getByRole('button', { name: 'Publish now' }).click()

    await expect(page.getByText('Event published!')).toBeVisible()

    const layout = await page.evaluate(() => {
      const heading = document.querySelector('h2')
      const buttons = Array.from(document.querySelectorAll('a, button')).filter((el) =>
        /Back to My Club|Create another/.test(el.textContent ?? ''),
      )
      const buttonRow = buttons[0]?.parentElement
      const card = document.querySelector('.rounded-2xl.glass, .rounded-2xl')
      return {
        headingText: heading?.textContent ?? '',
        buttonCount: buttons.length,
        buttonRowFlex: buttonRow ? getComputedStyle(buttonRow).display : '',
        buttonRowGap: buttonRow ? getComputedStyle(buttonRow).gap : '',
        hasMisalignedLink: buttons.some((b) => {
          const cls = b.className
          return cls.includes('mt-8') && b.tagName === 'A'
        }),
        hasStickyFooter: !!document.querySelector('[class*="bg-black/80"]'),
        viewportWidth: window.innerWidth,
        cardWidth: card?.getBoundingClientRect().width ?? 0,
        buttonsOverflow: buttons.some((b) => {
          const r = b.getBoundingClientRect()
          return r.right > window.innerWidth || r.left < 0
        }),
      }
    })

    expect(layout.headingText).toContain('Event published')
    expect(layout.buttonCount).toBe(2)
    expect(layout.hasStickyFooter).toBe(true)
    expect(layout.hasMisalignedLink).toBe(false)
    if (layout.buttonsOverflow) {
      console.log('ISSUE: success page buttons overflow viewport')
    }
  })

  test('success page after save draft', async ({ page }) => {
    await page.goto('/create-event')
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByText('Saved as draft')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to My Club' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create another' })).toBeVisible()
  })
})
