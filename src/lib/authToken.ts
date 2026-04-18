export const AUTH_TOKEN_STORAGE_KEY = 'persista.auth.token'
export const AUTH_TOKEN_EXPIRY_STORAGE_KEY = 'persista.auth.expiresAtUtc'

export type JwtPayload = {
  UserId?: string
  Role?: string
  [key: string]: unknown
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function setAuthTokenExpiry(expiresAtUtc: string): void {
  sessionStorage.setItem(AUTH_TOKEN_EXPIRY_STORAGE_KEY, expiresAtUtc)
}

export function getAuthTokenExpiry(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_EXPIRY_STORAGE_KEY)
}

export function clearAuthTokenExpiry(): void {
  sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_STORAGE_KEY)
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split('.')
  if (segments.length < 2) {
    return null
  }

  try {
    const payload = segments[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decodedPayload = atob(normalized)
    return JSON.parse(decodedPayload) as JwtPayload
  } catch {
    return null
  }
}
