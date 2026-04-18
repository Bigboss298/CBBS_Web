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

export type LevelOptionDto = {
  id: string
  name: string
}

export type CreateLevelRequestDto = {
  name: string
  departmentId: string
}

type LevelState = {
  levels: LevelDto[]
  levelOptions: LevelOptionDto[]
  isFetching: boolean
  isFetchingOptions: boolean
  isCreating: boolean
  errorMessage: string | null
  fetchLevels: () => Promise<void>
  fetchLevelOptionsByDepartment: (departmentId: string) => Promise<void>
  createLevel: (payload: CreateLevelRequestDto) => Promise<LevelDto | null>
  clearLevelError: () => void
}

export const useLevelStore = create<LevelState>((set) => ({
  levels: [],
  levelOptions: [],
  isFetching: false,
  isFetchingOptions: false,
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

  fetchLevelOptionsByDepartment: async (departmentId) => {
    if (!departmentId) {
      set({ levelOptions: [] })
      return
    }

    set({ isFetchingOptions: true, errorMessage: null })
    try {
      const response = await apiClient.get<LevelOptionDto[]>(`api/Level/department/${departmentId}/options`)
      set({
        levelOptions: response.data,
        isFetchingOptions: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isFetchingOptions: false,
        levelOptions: [],
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch level options.',
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
