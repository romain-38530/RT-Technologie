import { apiFetch, getAuthToken } from './client'
import type { Order, OrderImport, ApiResponse } from '@/types'

export const ordersApi = {
  // Get order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    return apiFetch<Order>(`/industry/orders/${orderId}`, {
      token: getAuthToken() || undefined,
    })
  },

  // Import orders
  importOrders: async (orders: OrderImport[], traceId?: string): Promise<ApiResponse<string>> => {
    return apiFetch<ApiResponse<string>>('/industry/orders/import', {
      method: 'POST',
      body: JSON.stringify(orders),
      token: getAuthToken() || undefined,
      traceId,
    })
  },

  // Dispatch order
  dispatchOrder: async (orderId: string, traceId?: string): Promise<ApiResponse<any>> => {
    return apiFetch<ApiResponse<any>>(`/industry/orders/${orderId}/dispatch`, {
      method: 'POST',
      token: getAuthToken() || undefined,
      traceId,
    })
  },

  // Get all orders (custom implementation - not in API yet)
  getAllOrders: async (): Promise<Order[]> => {
    // This would need to be implemented in the backend
    // For now, return empty array
    return []
  },
}
