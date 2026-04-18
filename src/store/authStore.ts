import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'
import {
  clearAuthToken,
  clearAuthTokenExpiry,
  decodeJwtPayload,
  getAuthToken,
  getAuthTokenExpiry,
  setAuthToken,
  setAuthTokenExpiry,
} from '../lib/authToken'

export type LoginRequestDto = {
  identifier: string
  password: string
}

export type LoginResponseDto = {
  isSuccess: boolean
  message: string
  token: string | null
  expiresAtUtc: string | null
  isFirstLogin: boolean
}

type AuthUser = {
  userId: string | null
  role: string | null
}

const parseFirstLoginFromToken = (token: string | null): boolean => {
  if (!token) {
    return false
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return false
  }

  const firstLoginClaim = payload.IsFirstLogin ?? payload.isFirstLogin
  if (typeof firstLoginClaim === 'boolean') {
    return firstLoginClaim
  }

  if (typeof firstLoginClaim === 'string') {
    return firstLoginClaim.toLowerCase() === 'true'
  }

  return false
}

type AuthState = {
  token: string | null
  expiresAtUtc: string | null
  user: AuthUser
  isAuthenticated: boolean
  isFirstLogin: boolean
  isLoading: boolean
  errorMessage: string | null
  initializeAuth: () => void
  login: (payload: LoginRequestDto) => Promise<boolean>
  logout: () => void
}

const parseAuthUserFromToken = (token: string | null): AuthUser => {
  if (!token) {
    return {
      userId: null,
      role: null,
    }
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return {
      userId: null,
      role: null,
    }
  }

  const roleFromClaim =
    typeof payload.Role === 'string'
      ? payload.Role
      : typeof payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'string'
        ? (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string)
        : null

  return {
    userId: typeof payload.UserId === 'string' ? payload.UserId : null,
    role: roleFromClaim,
  }
}

const isTokenExpired = (expiresAtUtc: string | null): boolean => {
  if (!expiresAtUtc) {
    return true
  }

  const expiresAtTimestamp = Date.parse(expiresAtUtc)
  if (Number.isNaN(expiresAtTimestamp)) {
    return true
  }

  return Date.now() >= expiresAtTimestamp
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  expiresAtUtc: null,
  user: {
    userId: null,
    role: null,
  },
  isAuthenticated: false,
  isFirstLogin: false,
  isLoading: false,
  errorMessage: null,

  initializeAuth: () => {
    const token = getAuthToken()
    const expiresAtUtc = getAuthTokenExpiry()

    if (!token || isTokenExpired(expiresAtUtc)) {
      clearAuthToken()
      clearAuthTokenExpiry()
      set({
        token: null,
        expiresAtUtc: null,
        user: {
          userId: null,
          role: null,
        },
        isAuthenticated: false,
        isFirstLogin: false,
      })
      return
    }

    set({
      token,
      expiresAtUtc,
      user: parseAuthUserFromToken(token),
      isAuthenticated: true,
      isFirstLogin: parseFirstLoginFromToken(token),
    })
  },

  login: async (payload) => {
    set({
      isLoading: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.post<LoginResponseDto>('api/Auth/login', payload)
      const loginResponse = response.data

      if (!loginResponse.isSuccess || !loginResponse.token || !loginResponse.expiresAtUtc) {
        clearAuthToken()
        clearAuthTokenExpiry()

        set({
          token: null,
          expiresAtUtc: null,
          user: {
            userId: null,
            role: null,
          },
          isAuthenticated: false,
          isFirstLogin: false,
          isLoading: false,
          errorMessage: loginResponse.message,
        })

        return false
      }

      setAuthToken(loginResponse.token)
      setAuthTokenExpiry(loginResponse.expiresAtUtc)

      set({
        token: loginResponse.token,
        expiresAtUtc: loginResponse.expiresAtUtc,
        user: parseAuthUserFromToken(loginResponse.token),
        isAuthenticated: true,
        isFirstLogin: loginResponse.isFirstLogin,
        isLoading: false,
        errorMessage: null,
      })

      return true
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>

      set({
        isLoading: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to login. Please try again.',
      })

      return false
    }
  },

  logout: () => {
    clearAuthToken()
    clearAuthTokenExpiry()

    set({
      token: null,
      expiresAtUtc: null,
      user: {
        userId: null,
        role: null,
      },
      isAuthenticated: false,
      isFirstLogin: false,
      isLoading: false,
      errorMessage: null,
    })
  },
}))
