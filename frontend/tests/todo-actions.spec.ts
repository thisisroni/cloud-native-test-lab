import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

const existingTodo = {
  id: 'mock-id-1',
  name: 'Buy milk',
  description: 'Get 2 cartons from the store',
  status: false
}

test.describe('Todo Item Actions', () => {

  test('should mark a todo as complete and apply strikethrough style when Complete button is clicked', async ({ page }) => {
    // arrange
    await page.route('**/api/v1/todos', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ todos: [existingTodo] })
        })
      }
    })

    await page.goto(BASE_URL)
    await expect(page.getByRole('heading', { name: 'Buy milk' })).toBeVisible()

    // arrange
    await page.route('**/api/v1/todos/**', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ todo: { ...existingTodo, status: true } })
        })
      }
    })

    await page.route('**/api/v1/todos', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ todos: [{ ...existingTodo, status: true }] })
        })
      }
    })

    // act
    await page.getByRole('button', { name: 'Complete' }).click()

    // assert
    const todoName = page.getByRole('heading', { name: 'Buy milk' })
    const todoDesc = page.getByText('Get 2 cartons from the store')

    await expect(todoName).toHaveClass(/line-through/)
    await expect(todoDesc).toHaveClass(/line-through/)

    // assert
    await expect(page.getByRole('button', { name: 'Complete' })).toBeHidden()
  })

  test('should remove a todo from the list when Delete button is clicked', async ({ page }) => {
    // arrange
    await page.route('**/api/v1/todos', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ todos: [existingTodo] })
        })
      }
    })

    await page.goto(BASE_URL)
    await expect(page.getByRole('heading', { name: 'Buy milk' })).toBeVisible()

    // arrange
    await page.route('**/api/v1/todos/**', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 })
      }
    })

    await page.route('**/api/v1/todos', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ todos: [] })
        })
      }
    })

    // act
    await page.getByRole('button', { name: 'Delete' }).click()

    // assert
    await expect(page.getByRole('heading', { name: 'Buy milk' })).not.toBeVisible()
    await expect(page.getByText('Get 2 cartons from the store')).not.toBeVisible()
  })
})
