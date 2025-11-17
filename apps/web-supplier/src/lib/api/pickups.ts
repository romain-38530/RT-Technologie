import { coreOrdersApi, planningApi } from './client'
import type { Pickup, TimeSlot, Document, PreparationChecklist, KPI } from '@/types'

export const pickupsApi = {
  // Récupérer tous les pickups
  getAll: async (status?: string): Promise<Pickup[]> => {
    const params = status ? { status } : {}
    const { data } = await coreOrdersApi.get('/pickups', { params })
    return data
  },

  // Récupérer un pickup par ID
  getById: async (id: string): Promise<Pickup> => {
    const { data } = await coreOrdersApi.get(`/pickups/${id}`)
    return data
  },

  // Proposer un créneau
  proposeSlot: async (pickupId: string, slot: Omit<TimeSlot, 'id' | 'createdAt' | 'status'>): Promise<TimeSlot> => {
    const { data } = await planningApi.post(`/pickups/${pickupId}/slots`, slot)
    return data
  },

  // Confirmer un créneau
  confirmSlot: async (pickupId: string, slotId: string): Promise<TimeSlot> => {
    const { data } = await planningApi.put(`/pickups/${pickupId}/slots/${slotId}/confirm`)
    return data
  },

  // Récupérer les créneaux d'un pickup
  getSlots: async (pickupId: string): Promise<TimeSlot[]> => {
    const { data } = await planningApi.get(`/pickups/${pickupId}/slots`)
    return data
  },

  // Uploader un document
  uploadDocument: async (pickupId: string, file: File, type: Document['type']): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const { data } = await coreOrdersApi.post(`/pickups/${pickupId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  // Récupérer les documents d'un pickup
  getDocuments: async (pickupId: string): Promise<Document[]> => {
    const { data } = await coreOrdersApi.get(`/pickups/${pickupId}/documents`)
    return data
  },

  // Mettre à jour la checklist de préparation
  updateChecklist: async (pickupId: string, checklist: PreparationChecklist): Promise<PreparationChecklist> => {
    const { data } = await coreOrdersApi.put(`/pickups/${pickupId}/checklist`, checklist)
    return data
  },

  // Récupérer la checklist
  getChecklist: async (pickupId: string): Promise<PreparationChecklist> => {
    const { data } = await coreOrdersApi.get(`/pickups/${pickupId}/checklist`)
    return data
  },

  // Confirmer que le pickup est prêt
  markAsReady: async (pickupId: string): Promise<Pickup> => {
    const { data } = await coreOrdersApi.put(`/pickups/${pickupId}/ready`)
    return data
  },

  // Confirmer que le pickup a été effectué
  markAsPickedUp: async (pickupId: string): Promise<Pickup> => {
    const { data } = await coreOrdersApi.put(`/pickups/${pickupId}/picked-up`)
    return data
  },

  // Récupérer les KPIs
  getKPIs: async (startDate?: string, endDate?: string): Promise<KPI> => {
    const params = { startDate, endDate }
    const { data } = await coreOrdersApi.get('/pickups/kpis', { params })
    return data
  },
}
