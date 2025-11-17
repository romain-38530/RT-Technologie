import axios from 'axios'

export const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const coreOrdersApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_CORE_ORDERS,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const planningApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PLANNING,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const notificationsApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_NOTIFICATIONS,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteurs pour gérer les erreurs
const errorHandler = (error: any) => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data)
  } else if (error.request) {
    console.error('Network Error:', error.request)
  } else {
    console.error('Error:', error.message)
  }
  return Promise.reject(error)
}

coreOrdersApi.interceptors.response.use(
  (response) => response,
  errorHandler
)

planningApi.interceptors.response.use(
  (response) => response,
  errorHandler
)

notificationsApi.interceptors.response.use(
  (response) => response,
  errorHandler
)
