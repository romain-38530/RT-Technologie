import axios, { AxiosInstance } from 'axios'

export const API_ENDPOINTS = {
  coreOrders: process.env.NEXT_PUBLIC_API_CORE_ORDERS || 'http://localhost:3001',
  planning: process.env.NEXT_PUBLIC_API_PLANNING || 'http://localhost:3004',
  ecmr: process.env.NEXT_PUBLIC_API_ECMR || 'http://localhost:3009',
  tracking: process.env.NEXT_PUBLIC_API_TRACKING || 'http://localhost:3008',
}

function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized
        console.error('Unauthorized access')
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const apiClients = {
  coreOrders: createApiClient(API_ENDPOINTS.coreOrders),
  planning: createApiClient(API_ENDPOINTS.planning),
  ecmr: createApiClient(API_ENDPOINTS.ecmr),
  tracking: createApiClient(API_ENDPOINTS.tracking),
}
