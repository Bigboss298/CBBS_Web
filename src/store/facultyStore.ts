import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export type FacultyDto = {
  id: string
  name: string
  createdAt: string
}

export type CreateFacultyRequestDto = {
  name: string
}

type FacultyState = {
  faculties: FacultyDto[]
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  fetchFaculties: () => Promise<void>
  createFaculty: (payload: CreateFacultyRequestDto) => Promise<FacultyDto | null>
  clearFacultyError: () => void
}

export const useFacultyStore = create<FacultyState>((set) => ({
  faculties: [],
  isFetching: false,
  isCreating: false,
  errorMessage: null,

  fetchFaculties: async () => {
    set({
      isFetching: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.get<FacultyDto[]>('api/Faculty')
      set({
        faculties: response.data,
        isFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch faculties.',
      })
    }
  },

  createFaculty: async (payload) => {
    set({
      isCreating: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.post<FacultyDto>('api/Faculty', payload)
      const createdFaculty = response.data

      set((state) => ({
        faculties: [createdFaculty, ...state.faculties],
        isCreating: false,
      }))

      return createdFaculty
    } catch (error) {
      const axiosError = error as AxiosError<string | { message?: string }>
      set({
        isCreating: false,
        errorMessage:
          typeof axiosError.response?.data === 'string'
            ? axiosError.response.data
            : axiosError.response?.data?.message ?? 'Unable to create faculty.',
      })
      return null
    }
  },

  clearFacultyError: () => {
    set({
      errorMessage: null,
    })
  },
}))
