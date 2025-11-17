import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import type { Order, OrderImport } from '@/types'

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAllOrders(),
  })
}

export function useImportOrders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orders, traceId }: { orders: OrderImport[]; traceId?: string }) =>
      ordersApi.importOrders(orders, traceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useDispatchOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, traceId }: { orderId: string; traceId?: string }) =>
      ordersApi.dispatchOrder(orderId, traceId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
