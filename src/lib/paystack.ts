import crypto from 'crypto'

/**
 * Verifies a Paystack webhook's x-paystack-signature header against the raw
 * request body. Must be called with the exact raw bytes Paystack signed —
 * re-serializing parsed JSON will not match.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string | undefined
): boolean {
  if (!secret || !signature) return false

  const expectedSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

  let signatureBuffer: Buffer
  let expectedBuffer: Buffer
  try {
    signatureBuffer = Buffer.from(signature, 'hex')
    expectedBuffer = Buffer.from(expectedSignature, 'hex')
  } catch {
    return false
  }

  return (
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  )
}
