import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { validate } from './validate'
import type { Request, Response } from 'express'

describe('validate middleware', () => {
  it('should call next() and update req.body with parsed data if validation succeeds', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().int(),
    })

    const middleware = validate(schema)

    const req = {
      body: {
        name: 'John Doe',
        age: 30,
        extra: 'should be stripped',
      },
    } as unknown as Request

    const res = {} as Response
    const next = vi.fn()

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.body).toEqual({ name: 'John Doe', age: 30 })
  })

  it('should respond with 400 and not call next() if validation fails', () => {
    const schema = z.object({
      name: z.string(),
    })

    const middleware = validate(schema)

    const req = {
      body: {
        age: 30,
      },
    } as unknown as Request

    const jsonMock = vi.fn()
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    const res = {
      status: statusMock,
    } as unknown as Response

    const next = vi.fn()

    middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            message: 'Invalid input: expected string, received undefined',
          }),
        ]),
      }),
    )
  })
})
