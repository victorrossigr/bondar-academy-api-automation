import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      json: tags
    })
  })

  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseJSON = await response.json()

    responseJSON.articles[0].title = 'This is a MOCK article title'
    responseJSON.articles[0].description = 'This is a MOCK article description'
    await route.fulfill({
      json: responseJSON
    })
  })

  await page.goto('https://conduit.bondaracademy.com');
});

test('get started link', async ({ page }) => {
  await expect(page.locator(".navbar-brand")).toHaveText(/conduit/);
  await expect(page.locator('.sidebar .tag-pill')).toContainText(["Test", "Playwright", "Automation", "API"])
  await expect(page.locator('.preview-link h1').nth(0)).toContainText('This is a MOCK article title')
  await expect(page.locator('.preview-link p').nth(0)).toContainText('This is a MOCK article description')
});