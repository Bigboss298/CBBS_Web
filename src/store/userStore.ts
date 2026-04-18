import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export const RoleEnum = {
  Student: 0,
  LevelAdviser: 1,
  HOD: 2,
  Dean: 3,
  FacultyOfficer: 4,
  Admin: 5,
} as const

export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum]

export type UserDto = {
  id: string
  matricNumber: string
  email: string
  fullName: string
  role: RoleEnum
  facultyId: string | null
  departmentId: string | null
  levelId: string | null
  assignedLevelId: string | null
  isActive: boolean
  createdAt: string
}

export type CreateUserRequestDto = {
  matricNumber: string
  email: string
  fullName: string
  password: string
  role: RoleEnum
  facultyId: string | null
  departmentId: string | null
  levelId: string | null
  assignedLevelId: string | null
  isActive: boolean
}

export type BulkStudentImportRowResultDto = {
  rowNumber: number
  matricNumber: string
  fullName: string
  email: string
  isSuccess: boolean
  message: string
  user: UserDto | null
}

export type BulkStudentImportResultDto = {
  message: string
  totalRows: number
  successCount: number
  failureCount: number
  rows: BulkStudentImportRowResultDto[]
}

export type PagedUserResultDto = {
  users: UserDto[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type UserFetchParams = {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
}

export function getCreatableRoles(creatorRole: string | null): RoleEnum[] {
  switch (creatorRole) {
    case 'Admin':
      return [RoleEnum.Dean, RoleEnum.FacultyOfficer, RoleEnum.HOD, RoleEnum.LevelAdviser, RoleEnum.Student]
    case 'Dean':
    case 'FacultyOfficer':
      return [RoleEnum.HOD, RoleEnum.LevelAdviser, RoleEnum.Student]
    case 'HOD':
      return [RoleEnum.LevelAdviser, RoleEnum.Student]
    case 'LevelAdviser':
      return [RoleEnum.Student]
    default:
      return []
  }
}

type UserState = {
  users: UserDto[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  searchTerm: string
  isFetching: boolean
  isCreating: boolean
  isBulkImporting: boolean
  bulkImportResult: BulkStudentImportResultDto | null
  errorMessage: string | null
  fetchUsers: (params?: UserFetchParams) => Promise<void>
  createUser: (payload: CreateUserRequestDto) => Promise<UserDto | null>
  bulkImportStudents: (file: File) => Promise<BulkStudentImportResultDto | null>
  clearUserError: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  pageNumber: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
  searchTerm: '',
  isFetching: false,
  isCreating: false,
  isBulkImporting: false,
  bulkImportResult: null,
  errorMessage: null,

  fetchUsers: async (params) => {
    const pageNumber = Math.max(params?.pageNumber ?? get().pageNumber, 1)
    const pageSize = Math.max(params?.pageSize ?? get().pageSize, 1)
    const searchTerm = params?.searchTerm ?? get().searchTerm

    set({
      isFetching: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.get<PagedUserResultDto>('api/User/paged', {
        params: {
          pageNumber,
          pageSize,
          searchTerm: searchTerm || undefined,
        },
      })
      set({
        users: response.data.users,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        searchTerm,
        isFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch users.',
      })
    }
  },

  createUser: async (payload) => {
    set({
      isCreating: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.post<UserDto>('api/User', payload)
      const createdUser = response.data

      set({ isCreating: false })

      await get().fetchUsers({
        pageNumber: get().pageNumber,
        pageSize: get().pageSize,
        searchTerm: get().searchTerm,
      })

      return createdUser
    } catch (error) {
      const axiosError = error as AxiosError<string | { message?: string }>
      const message =
        typeof axiosError.response?.data === 'string'
          ? axiosError.response.data
          : axiosError.response?.data?.message ?? 'Unable to create user.'

      set({
        isCreating: false,
        errorMessage: message,
      })
      return null
    }
  },

  bulkImportStudents: async (file) => {
    set({
      isBulkImporting: true,
      bulkImportResult: null,
      errorMessage: null,
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post<BulkStudentImportResultDto>('api/User/bulk-import-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      set({
        isBulkImporting: false,
        bulkImportResult: response.data,
      })

      await get().fetchUsers({
        pageNumber: get().pageNumber,
        pageSize: get().pageSize,
        searchTerm: get().searchTerm,
      })

      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<string | { message?: string }>
      const message =
        typeof axiosError.response?.data === 'string'
          ? axiosError.response.data
          : axiosError.response?.data && typeof axiosError.response.data === 'object'
            ? axiosError.response.data.message ?? 'Unable to import students.'
            : 'Unable to import students.'

      set({
        isBulkImporting: false,
        errorMessage: message,
      })

      return null
    }
  },

  clearUserError: () => {
    set({
      errorMessage: null,
    })
  },
}))
