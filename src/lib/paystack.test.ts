import crypto from 'crypto'
import { describe, expect, it } from 'vitest'
import { verifyPaystackSignature } from './paystack'

const secret = 'sk_test_secret'
const body = JSON.stringify({ event: 'charge.success', data: { reference: 'order123' } })

function sign(payload: string, key: string) {
  return crypto.createHmac('sha512', key).update(payload).digest('hex')
}

describe('verifyPaystackSignature', () => {
  it('accepts a correctly signed payload', () => {
    const signature = sign(body, secret)
    expect(verifyPaystackSignature(body, signature, secret)).toBe(true)
  })

  it('rejects a payload whose body was tampered with after signing', () => {
    const signature = sign(body, secret)
    const tamperedBody = JSON.stringify({ event: 'charge.success', data: { reference: 'order999' } })
    expect(verifyPaystackSignature(tamperedBody, signature, secret)).toBe(false)
  })

  it('rejects a signature produced with the wrong secret', () => {
    const signature = sign(body, 'wrong_secret')
    expect(verifyPaystackSignature(body, signature, secret)).toBe(false)
  })

  it('rejects when the signature header is missing', () => {
    expect(verifyPaystackSignature(body, null, secret)).toBe(false)
    expect(verifyPaystackSignature(body, undefined, secret)).toBe(false)
  })

  it('rejects when the server has no configured secret', () => {
    const signature = sign(body, secret)
    expect(verifyPaystackSignature(body, signature, undefined)).toBe(false)
  })

  it('rejects a non-hex signature without throwing', () => {
    expect(verifyPaystackSignature(body, 'not-valid-hex-!!', secret)).toBe(false)
  })
})
