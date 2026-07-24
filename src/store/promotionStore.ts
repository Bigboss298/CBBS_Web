import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export type PromoteStudentsResultDto = {
  isSuccess: boolean
  message: string
  promotedCount: number
  graduatedCount: number
}

type PromotionState = {
  isPromoting: boolean
  lastResult: PromoteStudentsResultDto | null
  errorMessage: string | null
  promoteStudents: (departmentId: string) => Promise<PromoteStudentsResultDto | null>
  clearPromotionState: () => void
}

export const usePromotionStore = create<PromotionState>((set) => ({
  isPromoting: false,
  lastResult: null,
  errorMessage: null,

  promoteStudents: async (departmentId) => {
    set({ isPromoting: true, errorMessage: null, lastResult: null })
    try {
      const response = await apiClient.post<PromoteStudentsResultDto>('api/User/promote', { departmentId })
      set({ isPromoting: false, lastResult: response.data })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<string | { message?: string }>
      const message =
        typeof axiosError.response?.data === 'string'
          ? axiosError.response.data
          : axiosError.response?.data?.message ?? 'Unable to run promotion.'
      set({ isPromoting: false, errorMessage: message })
      return null
    }
  },

  clearPromotionState: () => set({ isPromoting: false, lastResult: null, errorMessage: null }),
}))
