import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { serverOf } from '../src/server'
import * as TodoRepo from '../src/repo/todo'
import { FastifyInstance } from 'fastify'
import { Todo, TodoBody } from '../src/types/todo'

describe('Create Todo API Testing', () => {
  let server: FastifyInstance

  beforeAll(async () => {
    server = serverOf()
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('Given a valid todo body, When receive a POST /api/v1/todos request, Then it should response with status code 201 and the created todo', async () => {
    // arrange
    const todoBody: TodoBody = {
      name: 'Buy milk',
      description: 'Get 2 cartons from the store'
    }
    const createdTodo: Todo = {
      id: 'new-id-001',
      name: todoBody.name,
      description: todoBody.description,
      status: false
    }
    vi.spyOn(TodoRepo, 'createTodo').mockImplementation(async () => createdTodo)

    // act
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: todoBody
    })

    // assert
    expect(response.statusCode).toBe(201)
    const result = JSON.parse(response.body)['todo']
    expect(result.name).toBe(todoBody.name)
    expect(result.description).toBe(todoBody.description)
    expect(result.status).toBe(false)
  })

  test('Given a todo body with empty description, When receive a POST /api/v1/todos request, Then it should response with status code 201 and the created todo with empty description', async () => {
    // arrange
    const todoBody: TodoBody = {
      name: 'Take out trash',
      description: ''
    }
    const createdTodo: Todo = {
      id: 'new-id-002',
      name: todoBody.name,
      description: '',
      status: false
    }
    vi.spyOn(TodoRepo, 'createTodo').mockImplementation(async () => createdTodo)

    // act: 送出 POST /api/v1/todos，description 為空字串
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: todoBody
    })

    // assert: HTTP 201 + description 為空字串、status 為 false
    expect(response.statusCode).toBe(201)
    const result = JSON.parse(response.body)['todo']
    expect(result.name).toBe('Take out trash')
    expect(result.description).toBe('')
    expect(result.status).toBe(false)
  })
})
