import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export type AuditLogDto = {
  id: string
  userId: string
  userFullName: string
  userMatricNumber: string
  action: string
  description: string | null
  createdAt: string
}

type PaginatedAuditLogResponse = {
  logs: AuditLogDto[]
  hasMore: boolean
  totalFetched: number
}

type AuditLogState = {
  // My Logs Pagination
  myLogs: AuditLogDto[]
  myLogsHasMore: boolean
  myLogsOffset: number
  myLogsPageSize: number
  isMyLogsFetching: boolean

  // All Logs Pagination
  allLogs: AuditLogDto[]
  allLogsHasMore: boolean
  allLogsOffset: number
  allLogsPageSize: number
  isAllLogsFetching: boolean
  allLogsFilteredUserId: Guid | null

  // Global
  errorMessage: string | null

  // Methods
  fetchMyLogsFirstPage: () => Promise<void>
  fetchMyLogsNextPage: () => Promise<void>
  fetchAllLogsFirstPage: (filteredUserId?: Guid) => Promise<void>
  fetchAllLogsNextPage: () => Promise<void>
  clearAuditLogError: () => void
  resetPagination: () => void
}

type Guid = string | null

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  // My Logs
  myLogs: [],
  myLogsHasMore: false,
  myLogsOffset: 0,
  myLogsPageSize: 500, // Backend batch size
  isMyLogsFetching: false,

  // All Logs
  allLogs: [],
  allLogsHasMore: false,
  allLogsOffset: 0,
  allLogsPageSize: 500, // Backend batch size
  isAllLogsFetching: false,
  allLogsFilteredUserId: null,

  // Global
  errorMessage: null,

  fetchMyLogsFirstPage: async () => {
    set({
      myLogs: [],
      myLogsOffset: 0,
      myLogsHasMore: false,
      isMyLogsFetching: true,
      errorMessage: null,
    })

    try {
      const state = get()
      const response = await apiClient.get<PaginatedAuditLogResponse>('api/AuditLog/me', {
        params: {
          skip: 0,
          take: state.myLogsPageSize,
        },
      })

      set({
        myLogs: response.data.logs,
        myLogsHasMore: response.data.hasMore,
        myLogsOffset: response.data.totalFetched,
        isMyLogsFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isMyLogsFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch activity logs.',
      })
    }
  },

  fetchMyLogsNextPage: async () => {
    const state = get()
    if (!state.myLogsHasMore || state.isMyLogsFetching) return

    set({ isMyLogsFetching: true, errorMessage: null })

    try {
      const response = await apiClient.get<PaginatedAuditLogResponse>('api/AuditLog/me', {
        params: {
          skip: state.myLogsOffset,
          take: state.myLogsPageSize,
        },
      })

      set({
        myLogs: [...state.myLogs, ...response.data.logs],
        myLogsHasMore: response.data.hasMore,
        myLogsOffset: state.myLogsOffset + response.data.totalFetched,
        isMyLogsFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isMyLogsFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch activity logs.',
      })
    }
  },

  fetchAllLogsFirstPage: async (filteredUserId?: Guid) => {
    set({
      allLogs: [],
      allLogsOffset: 0,
      allLogsHasMore: false,
      allLogsFilteredUserId: filteredUserId ?? null,
      isAllLogsFetching: true,
      errorMessage: null,
    })

    try {
      const state = get()
      const response = await apiClient.get<PaginatedAuditLogResponse>('api/AuditLog', {
        params: {
          userId: filteredUserId,
          skip: 0,
          take: state.allLogsPageSize,
        },
      })

      set({
        allLogs: response.data.logs,
        allLogsHasMore: response.data.hasMore,
        allLogsOffset: response.data.totalFetched,
        isAllLogsFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isAllLogsFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch activity logs.',
      })
    }
  },

  fetchAllLogsNextPage: async () => {
    const state = get()
    if (!state.allLogsHasMore || state.isAllLogsFetching) return

    set({ isAllLogsFetching: true, errorMessage: null })

    try {
      const response = await apiClient.get<PaginatedAuditLogResponse>('api/AuditLog', {
        params: {
          userId: state.allLogsFilteredUserId,
          skip: state.allLogsOffset,
          take: state.allLogsPageSize,
        },
      })

      set({
        allLogs: [...state.allLogs, ...response.data.logs],
        allLogsHasMore: response.data.hasMore,
        allLogsOffset: state.allLogsOffset + response.data.totalFetched,
        isAllLogsFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isAllLogsFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch activity logs.',
      })
    }
  },

  clearAuditLogError: () => set({ errorMessage: null }),

  resetPagination: () =>
    set({
      myLogs: [],
      myLogsOffset: 0,
      myLogsHasMore: false,
      allLogs: [],
      allLogsOffset: 0,
      allLogsHasMore: false,
      allLogsFilteredUserId: null,
    }),
}))

