import { AxiosError } from 'axios'
import { create } from 'zustand'
import { apiClient } from '../lib/apiClient'

export const DocumentTypeEnum = {
  AdmissionLetter: 0,
  BioData: 1,
  Result: 2,
  ClearanceCertificate: 3,
  PaymentReceipt: 4,
  Others: 5,
} as const

export type DocumentTypeEnum = (typeof DocumentTypeEnum)[keyof typeof DocumentTypeEnum]

export type DocumentDto = {
  id: string
  fileName: string
  fileUrl: string
  documentType: DocumentTypeEnum
  uploadedById: string
  uploadedByName: string
  uploadedByMatricNumber: string
  facultyId: string | null
  facultyName: string | null
  departmentId: string | null
  departmentName: string | null
  levelId: string | null
  levelName: string | null
  createdAt: string
}

type UploadDocumentRequest = {
  file: File
  documentType: DocumentTypeEnum
}

type DownloadDocumentRequest = {
  documentId: string
  fileName: string
}

type DocumentState = {
  documents: DocumentDto[]
  isFetching: boolean
  isUploading: boolean
  errorMessage: string | null
  fetchDocuments: () => Promise<void>
  uploadDocument: (payload: UploadDocumentRequest) => Promise<DocumentDto | null>
  downloadDocument: (payload: DownloadDocumentRequest) => Promise<void>
  clearDocumentError: () => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isFetching: false,
  isUploading: false,
  errorMessage: null,

  fetchDocuments: async () => {
    set({
      isFetching: true,
      errorMessage: null,
    })

    try {
      const response = await apiClient.get<DocumentDto[]>('api/Document')
      set({
        documents: response.data,
        isFetching: false,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isFetching: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to fetch documents.',
      })
    }
  },

  uploadDocument: async (payload) => {
    set({
      isUploading: true,
      errorMessage: null,
    })

    try {
      const formData = new FormData()
      formData.append('DocumentType', String(payload.documentType))
      formData.append('File', payload.file)

      const response = await apiClient.post<DocumentDto>('api/Document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const uploadedDocument = response.data

      set((state) => ({
        documents: [uploadedDocument, ...state.documents],
        isUploading: false,
      }))

      return uploadedDocument
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        isUploading: false,
        errorMessage: axiosError.response?.data?.message ?? 'Unable to upload document.',
      })

      return null
    }
  },

  downloadDocument: async ({ documentId, fileName }) => {
    try {
      const response = await apiClient.get(`api/Document/${documentId}/download`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] ?? 'application/octet-stream',
      })
      const objectUrl = window.URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      anchor.href = objectUrl
      anchor.download = fileName
      anchor.style.display = 'none'
      window.document.body.appendChild(anchor)
      anchor.click()
      window.document.body.removeChild(anchor)
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      set({
        errorMessage: axiosError.response?.data?.message ?? 'Unable to download document.',
      })
    }
  },

  clearDocumentError: () => {
    set({
      errorMessage: null,
    })
  },
}))
