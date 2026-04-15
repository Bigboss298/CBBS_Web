import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export type LevelDto = {
  id: string
  name: string
  departmentId: string
  departmentName: string
  facultyId: string
  createdAt: string
}

export type CreateLevelRequestDto = {
  name: string
  departmentId: string
}

type LevelState = {
  levels: LevelDto[]
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  fetchLevels: () => Promise<void>
  createLevel: (payload: CreateLevelRequestDto) => Promise<LevelDto | null>
  clearLevelError: () => void
}

export const useLevelStore = create<LevelState>((set) => ({
  levels: [],
  isFetching: false,
  isCreating: false,
  errorMessage: null,

  fetchLevels: async () => {
    set({ isFetching: true, errorMessage: null })
    try {
      const response = await apiClient.get<LevelDto[]>('api/Level')
      set({ levels: response.data, isFetching: false })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch levels.',
      })
    }
  },

  createLevel: async (payload) => {
    set({ isCreating: true, errorMessage: null })
    try {
      const response = await apiClient.post<LevelDto>('api/Level', payload)
      const createdLevel = response.data
      set((state) => ({
        levels: [createdLevel, ...state.levels],
        isCreating: false,
      }))
      return createdLevel
    } catch (error) {
      const axiosError = error as AxiosError<string | { message?: string }>
      set({
        isCreating: false,
        errorMessage:
          typeof axiosError.response?.data === 'string'
            ? axiosError.response.data
            : axiosError.response?.data?.message ?? 'Unable to create level.',
      })
      return null
    }
  },

  clearLevelError: () => set({ errorMessage: null }),
}))
