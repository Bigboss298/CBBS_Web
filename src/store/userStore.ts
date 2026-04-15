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

export function getCreatableRoles(creatorRole: string | null): RoleEnum[] {
  switch (creatorRole) {
    case 'Admin':
      return [RoleEnum.Dean, RoleEnum.FacultyOfficer, RoleEnum.HOD, RoleEnum.LevelAdviser, RoleEnum.Student]
    case 'Dean':
    case 'FacultyOfficer':
      return [RoleEnum.HOD, RoleEnum.LevelAdviser, RoleEnum.Student]
    case 'HOD':
      return [RoleEnum.LevelAdviser, RoleEnum.Student]
    default:
      return []
  }
}

type UserState = {
  users: UserDto[]
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  fetchUsers: () => Promise<void>
  createUser: (payload: CreateUserRequestDto) => Promise<UserDto | null>
  clearUserError: () => void
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isFetching: false,
  isCreating: false,
  errorMessage: null,

  fetchUsers: async () => {
    set({
      isFetching: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.get<UserDto[]>('api/User')
      set({
        users: response.data,
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

      set((state) => ({
        users: [createdUser, ...state.users],
        isCreating: false,
      }))

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

  clearUserError: () => {
    set({
      errorMessage: null,
    })
  },
}))
