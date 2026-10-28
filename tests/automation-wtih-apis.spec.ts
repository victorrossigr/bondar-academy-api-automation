import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test('Mocking article', async ({ page }) => {
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

  await page.goto('https://conduit.bondaracademy.com')
  await expect(page.locator(".navbar-brand")).toHaveText(/conduit/)
  await expect(page.locator('.sidebar .tag-pill')).toContainText(["Test", "Playwright", "Automation", "API"])
  await expect(page.locator('.preview-link h1').nth(0)).toContainText('This is a MOCK article title')
  await expect(page.locator('.preview-link p').nth(0)).toContainText('This is a MOCK article description')
});

test('Creating and Deleting article', async ({ page, request }) => {
  // Login
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "pwuser.email@test.com",
        "password": "pwpass1020"
      }
    }
  })
  expect(loginResponse.status()).toEqual(200)
  const responseLoginJSON = await loginResponse.json()
  const token = responseLoginJSON.user.token

  // Creating the article
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Article Title Test",
        "description": "Article description API automation test",
        "body": "Article body API automation test",
        "tagList": ['Tag Test']
      }
    },
    headers: {
      Authorization: `Token ${token}`
    }
  })
  expect(newArticleResponse.status()).toEqual(201)

  // Deleting the article via API
  const articleResponseJSON = await newArticleResponse.json()
  const slugID = articleResponseJSON.article.slug
  const deletedArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugID}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })
  expect(deletedArticleResponse.status()).toEqual(204)

  await page.goto('https://conduit.bondaracademy.com')

  // Deleting the article via navigation
  // await expect(page.locator('.preview-link h1').first()).toHaveText('Article Title Test')
  // await page.getByText('Article Title Test').click()
  // await page.getByRole('button', { name: 'Delete Article' }).first().click()
  // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
  // await expect(page.locator('.preview-link h1').first()).not.toHaveText('Article Title Test')
})

test('Creating and deleting article comment', async ({ page, request }) => {
  // Login
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "pwuser.email@test.com",
        "password": "pwpass1020"
      }
    }
  })
  expect(loginResponse.status()).toEqual(200)
  const responseLoginJSON = await loginResponse.json()
  const token = responseLoginJSON.user.token

  // Commenting
  const commentResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments', {
    data: {
      "comment": {
        "body": "This is a comment test"
      }
    },
    headers: {
      Authorization: `Token ${token}`
    }
  })
  expect(commentResponse.status()).toEqual(200)

  // Deleting the comment via API
  const commentResponseJSON = await commentResponse.json()
  const commentID = commentResponseJSON.comment.id
  const deletedCommentResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments/${commentID}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })
  expect(deletedCommentResponse.status()).toEqual(200)

  await page.goto('https://conduit.bondaracademy.com')
  await expect(page.locator('.preview-link h1').first()).toHaveText('Discover Bondar Academy: Your Gateway to Efficient Learning')
  await page.getByText('Discover Bondar Academy: Your Gateway to Efficient Learning').click()

  // Deleting the comment via navigation  
  // await page.locator('app-article-comment', { hasText: 'This is a comment test' }).locator('.ion-trash-a').click()
  // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments/**')
  // await expect(page.locator('app-article-page')).not.toHaveText('This is a comment test')
})

test('Favoriting article', async ({ page, request }) => {
  // Login
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "pwuser.email@test.com",
        "password": "pwpass1020"
      }
    }
  })
  expect(loginResponse.status()).toEqual(200)
  const responseLoginJSON = await loginResponse.json()
  const token = responseLoginJSON.user.token

  // Favoriting
  const favoriteResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/favorite', {
    headers: {
      Authorization: `Token ${token}`
    }
  })
  expect(favoriteResponse.status()).toEqual(200)

  await page.goto('https://conduit.bondaracademy.com')
  await expect(page.locator(".navbar-brand")).toHaveText(/conduit/)
})