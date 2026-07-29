import axios from 'axios'
import { clearAuthToken, clearAuthTokenExpiry, getAuthToken } from './authToken'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'Cbbs-env.eba-p4zbykdz.eu-west-1.elasticbeanstalk.com/'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAuthToken()
      clearAuthTokenExpiry()
    }

    return Promise.reject(error)
  },
)
