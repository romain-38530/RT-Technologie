import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gridsApi } from '@/lib/api'
import type { Origin } from '@/types'

export function useOrigins(ownerOrgId?: string) {
  return useQuery({
    queryKey: ['origins', ownerOrgId],
    queryFn: () => gridsApi.getOrigins(ownerOrgId),
    select: (data) => data.items || [],
  })
}

export function useCreateOrigin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (origin: Omit<Origin, 'id'> & { id: string }) =>
      gridsApi.createOrigin(origin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['origins'] })
    },
  })
}

export function useGrids(params: {
  ownerOrgId: string
  origin?: string
  mode?: 'FTL' | 'LTL'
}) {
  return useQuery({
    queryKey: ['grids', params],
    queryFn: () => gridsApi.getGrids(params),
    select: (data) => data.items || [],
    enabled: !!params.ownerOrgId,
  })
}

export function useUploadGrid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      mode,
      origin,
      ownerOrgId,
      content,
      isCSV = true,
    }: {
      mode: 'FTL' | 'LTL'
      origin: string
      ownerOrgId: string
      content: string | any[]
      isCSV?: boolean
    }) => {
      if (isCSV && typeof content === 'string') {
        return gridsApi.uploadGridCSV(mode, origin, ownerOrgId, content)
      } else if (!isCSV && Array.isArray(content)) {
        return gridsApi.uploadGridJSON(mode, origin, ownerOrgId, content)
      }
      throw new Error('Invalid content type')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grids'] })
    },
  })
}
