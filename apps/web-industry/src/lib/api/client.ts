const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

export interface FetchOptions extends RequestInit {
  token?: string
  traceId?: string
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, traceId, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge existing headers
  if (fetchOptions.headers) {
    const existingHeaders = fetchOptions.headers as Record<string, string>
    Object.assign(headers, existingHeaders)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (traceId) {
    headers['x-trace-id'] = traceId
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, response.statusText, errorData)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
}
