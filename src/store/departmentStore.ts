import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export type DepartmentDto = {
  id: string
  name: string
  facultyId: string
  facultyName: string
  createdAt: string
}

export type CreateDepartmentRequestDto = {
  name: string
  facultyId: string
}

type DepartmentState = {
  departments: DepartmentDto[]
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  fetchDepartments: () => Promise<void>
  createDepartment: (payload: CreateDepartmentRequestDto) => Promise<DepartmentDto | null>
  clearDepartmentError: () => void
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  isFetching: false,
  isCreating: false,
  errorMessage: null,

  fetchDepartments: async () => {
    set({ isFetching: true, errorMessage: null })
    try {
      const response = await apiClient.get<DepartmentDto[]>('api/Department')
      set({ departments: response.data, isFetching: false })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch departments.',
      })
    }
  },

  createDepartment: async (payload) => {
    set({ isCreating: true, errorMessage: null })
    try {
      const response = await apiClient.post<DepartmentDto>('api/Department', payload)
      const createdDepartment = response.data
      set((state) => ({
        departments: [createdDepartment, ...state.departments],
        isCreating: false,
      }))
      return createdDepartment
    } catch (error) {
      const axiosError = error as AxiosError<string | { message?: string }>
      set({
        isCreating: false,
        errorMessage:
          typeof axiosError.response?.data === 'string'
            ? axiosError.response.data
            : axiosError.response?.data?.message ?? 'Unable to create department.',
      })
      return null
    }
  },

  clearDepartmentError: () => set({ errorMessage: null }),
}))
