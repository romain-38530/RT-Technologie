import { apiFetch, getAuthToken } from './client'
import type { Grid, Origin, ApiResponse } from '@/types'

export const gridsApi = {
  // Get origins
  getOrigins: async (ownerOrgId?: string): Promise<ApiResponse<Origin>> => {
    const params = ownerOrgId ? `?ownerOrgId=${ownerOrgId}` : ''
    return apiFetch<ApiResponse<Origin>>(`/industry/origins${params}`, {
      token: getAuthToken() || undefined,
    })
  },

  // Create origin
  createOrigin: async (origin: Omit<Origin, 'id'> & { id: string }): Promise<ApiResponse<Origin>> => {
    return apiFetch<ApiResponse<Origin>>('/industry/origins', {
      method: 'POST',
      body: JSON.stringify(origin),
      token: getAuthToken() || undefined,
    })
  },

  // Get grids
  getGrids: async (params: {
    ownerOrgId: string
    origin?: string
    mode?: 'FTL' | 'LTL'
  }): Promise<ApiResponse<Grid>> => {
    const searchParams = new URLSearchParams({
      ownerOrgId: params.ownerOrgId,
      ...(params.origin && { origin: params.origin }),
      ...(params.mode && { mode: params.mode }),
    })
    return apiFetch<ApiResponse<Grid>>(`/industry/grids?${searchParams}`, {
      token: getAuthToken() || undefined,
    })
  },

  // Upload grid CSV
  uploadGridCSV: async (
    mode: 'FTL' | 'LTL',
    origin: string,
    ownerOrgId: string,
    csvContent: string
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ mode, origin, ownerOrgId })
    return apiFetch<ApiResponse<any>>(`/industry/grids/upload?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
      },
      body: csvContent,
      token: getAuthToken() || undefined,
    })
  },

  // Upload grid JSON
  uploadGridJSON: async (
    mode: 'FTL' | 'LTL',
    origin: string,
    ownerOrgId: string,
    lines: any[]
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ mode, origin, ownerOrgId })
    return apiFetch<ApiResponse<any>>(`/industry/grids/upload?${params}`, {
      method: 'POST',
      body: JSON.stringify({ lines }),
      token: getAuthToken() || undefined,
    })
  },
}
