import crypto from 'crypto'

/**
 * Field-level encryption at rest (AES-256-GCM) for the private text on a worry:
 * description, nextStep, reframe, notes.
 *
 * Stored format: `enc:v1:<iv>:<authTag>:<ciphertext>` (base64 parts).
 * Key: FIELD_ENCRYPTION_KEY = 64 hex chars (32 bytes). Generate with `openssl rand -hex 32`.
 * Losing or changing the key makes existing entries unreadable, so back it up.
 */

const PREFIX = 'enc:v1:'
let cachedKey: Buffer | null = null

function getKey(): Buffer {
    if (cachedKey) return cachedKey
    const hex = process.env.FIELD_ENCRYPTION_KEY ?? ''
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
        throw new Error('FIELD_ENCRYPTION_KEY must be 64 hex characters (openssl rand -hex 32)')
    }
    cachedKey = Buffer.from(hex, 'hex')
    return cachedKey
}

/** Throws at boot when the key is missing or malformed. */
export function assertFieldKey(): void {
    getKey()
}

export function encryptField(plain: string): string {
    if (!plain) return ''
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
    const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`
}

export function decryptField(stored: string | undefined | null): string {
    if (!stored) return ''
    if (!stored.startsWith(PREFIX)) return stored
    const [ivB64, tagB64, ctB64] = stored.slice(PREFIX.length).split(':')
    try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'))
        decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
        return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString('utf8')
    } catch {
        return '[unreadable: encryption key changed]'
    }
}
