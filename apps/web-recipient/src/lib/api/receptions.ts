import { apiClients } from './client'
import type { Reception, ReceptionItem, CMRSignature } from './types'

export async function createReception(
  deliveryId: string,
  items: ReceptionItem[]
): Promise<Reception> {
  try {
    const response = await apiClients.coreOrders.post(`/receptions`, {
      deliveryId,
      items,
      receivedAt: new Date().toISOString(),
      status: 'in_progress',
    })
    return response.data
  } catch (error) {
    console.error('Error creating reception:', error)
    throw error
  }
}

export async function updateReception(
  receptionId: string,
  data: Partial<Reception>
): Promise<Reception> {
  try {
    const response = await apiClients.coreOrders.patch(
      `/receptions/${receptionId}`,
      data
    )
    return response.data
  } catch (error) {
    console.error('Error updating reception:', error)
    throw error
  }
}

export async function completeReception(
  receptionId: string,
  items: ReceptionItem[],
  notes?: string
): Promise<Reception> {
  try {
    const response = await apiClients.coreOrders.post(
      `/receptions/${receptionId}/complete`,
      { items, notes }
    )
    return response.data
  } catch (error) {
    console.error('Error completing reception:', error)
    throw error
  }
}

export async function signCMR(data: {
  receptionId: string
  deliveryId: string
  signatureData: string
  signedBy: string
  location?: { latitude: number; longitude: number }
}): Promise<CMRSignature> {
  try {
    const response = await apiClients.ecmr.post(`/cmr/sign`, {
      ...data,
      signedByRole: 'recipient',
      signedAt: new Date().toISOString(),
    })
    return response.data
  } catch (error) {
    console.error('Error signing CMR:', error)
    throw error
  }
}

export async function uploadReceptionPhoto(
  receptionId: string,
  photo: File
): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('photo', photo)
    formData.append('receptionId', receptionId)

    const response = await apiClients.coreOrders.post(
      `/receptions/${receptionId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.photoUrl
  } catch (error) {
    console.error('Error uploading photo:', error)
    throw error
  }
}
