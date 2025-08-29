import crypto from 'crypto'

const DEFAULT_ALGO = 'aes-256-gcm'

function getSecretKey(): Buffer {
  const secret = process.env.AI_KEY_ENC_SECRET
  if (!secret) {
    throw new Error('缺少环境变量 AI_KEY_ENC_SECRET 用于加密 API Key')
  }

  // 支持直接 32 字节或 base64 编码
  if (secret.length === 32) {
    return Buffer.from(secret)
  }
  try {
    const buf = Buffer.from(secret, 'base64')
    if (buf.length !== 32) {
      throw new Error('AI_KEY_ENC_SECRET base64 解码后长度必须为 32 字节')
    }
    return buf
  } catch {
    throw new Error('AI_KEY_ENC_SECRET 必须为 32 字节或其 base64 编码')
  }
}

export function encrypt(text: string): string {
  const key = getSecretKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(DEFAULT_ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

export function decrypt(payload: string): string {
  const key = getSecretKey()
  const [ivB64, tagB64, dataB64] = payload.split(':')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const encrypted = Buffer.from(dataB64, 'base64')
  const decipher = crypto.createDecipheriv(DEFAULT_ALGO, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
