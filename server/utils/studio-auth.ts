/// <reference types="node" />
import bcrypt from 'bcryptjs'

export interface StudioEditor {
  email: string
  passwordHash: string
  name: string
}

export function parseEditorAllowlist(): StudioEditor[] {
  const raw = process.env.STUDIO_EDITORS
  if (!raw) return []
  try {
    return JSON.parse(raw) as StudioEditor[]
  } catch {
    console.error('[Studio Auth] Failed to parse STUDIO_EDITORS env var')
    return []
  }
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Generate a bcrypt hash */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}
