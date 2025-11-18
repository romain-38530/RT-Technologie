import { apiClients } from './client'
import type { Anomaly, AnomalyType } from './types'

export async function createAnomaly(data: {
  receptionId: string
  deliveryId: string
  orderId: string
  type: AnomalyType
  severity: 'minor' | 'major' | 'critical'
  description: string
  items: Anomaly['items']
}): Promise<Anomaly> {
  try {
    const response = await apiClients.coreOrders.post(`/anomalies`, {
      ...data,
      status: 'reported',
      reportedAt: new Date().toISOString(),
      photos: [],
    })
    return response.data
  } catch (error) {
    console.error('Error creating anomaly:', error)
    throw error
  }
}

export async function getAnomalies(recipientId: string): Promise<Anomaly[]> {
  try {
    const response = await apiClients.coreOrders.get(`/anomalies`, {
      params: { recipientId },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching anomalies:', error)
    return getMockAnomalies()
  }
}

export async function getAnomalyById(anomalyId: string): Promise<Anomaly> {
  try {
    const response = await apiClients.coreOrders.get(`/anomalies/${anomalyId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching anomaly:', error)
    throw error
  }
}

export async function uploadAnomalyPhoto(
  anomalyId: string,
  photo: File
): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('photo', photo)
    formData.append('anomalyId', anomalyId)

    const response = await apiClients.coreOrders.post(
      `/anomalies/${anomalyId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.photoUrl
  } catch (error) {
    console.error('Error uploading anomaly photo:', error)
    throw error
  }
}

export async function updateAnomaly(
  anomalyId: string,
  data: Partial<Anomaly>
): Promise<Anomaly> {
  try {
    const response = await apiClients.coreOrders.patch(
      `/anomalies/${anomalyId}`,
      data
    )
    return response.data
  } catch (error) {
    console.error('Error updating anomaly:', error)
    throw error
  }
}

// Mock data for development
function getMockAnomalies(): Anomaly[] {
  return [
    {
      id: 'ANO-001',
      receptionId: 'REC-001',
      deliveryId: 'DEL-001',
      orderId: 'ORD-2024-001',
      type: 'damaged_goods',
      severity: 'major',
      status: 'in_review',
      description: 'Palettes endommagées lors du transport - emballage déchiré',
      items: [
        {
          productCode: 'PROD-001',
          productName: 'Pièces Automobiles Standard',
          expectedQuantity: 500,
          receivedQuantity: 500,
          issue: '2 palettes avec emballage déchiré, produits potentiellement endommagés',
        },
      ],
      photos: [],
      reportedBy: 'Jean Dupont',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ANO-002',
      receptionId: 'REC-002',
      deliveryId: 'DEL-002',
      orderId: 'ORD-2024-002',
      type: 'missing_items',
      severity: 'critical',
      status: 'acknowledged',
      description: 'Manque 50 unités de composants électroniques',
      items: [
        {
          productCode: 'PROD-002',
          productName: 'Composants Électroniques',
          expectedQuantity: 200,
          receivedQuantity: 150,
          issue: 'Manque 50 unités - 1/2 palette non livrée',
        },
      ],
      photos: [],
      reportedBy: 'Marie Martin',
      reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}
