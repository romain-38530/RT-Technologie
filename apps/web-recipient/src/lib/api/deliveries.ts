import { apiClients } from './client'
import type { Delivery, DeliveryStatus } from './types'

export async function getExpectedDeliveries(recipientId: string): Promise<Delivery[]> {
  try {
    const response = await apiClients.coreOrders.get(`/deliveries`, {
      params: {
        recipientId,
        status: ['scheduled', 'confirmed', 'in_transit', 'arriving_soon'],
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching expected deliveries:', error)
    // Return mock data for development
    return getMockDeliveries()
  }
}

export async function getDeliveryById(deliveryId: string): Promise<Delivery> {
  try {
    const response = await apiClients.coreOrders.get(`/deliveries/${deliveryId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching delivery:', error)
    throw error
  }
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus
): Promise<Delivery> {
  try {
    const response = await apiClients.coreOrders.patch(`/deliveries/${deliveryId}`, {
      status,
    })
    return response.data
  } catch (error) {
    console.error('Error updating delivery status:', error)
    throw error
  }
}

export async function getDeliveryETA(deliveryId: string): Promise<string | null> {
  try {
    const response = await apiClients.tracking.get(`/tracking/${deliveryId}/eta`)
    return response.data.eta
  } catch (error) {
    console.error('Error fetching ETA:', error)
    return null
  }
}

// Mock data for development
function getMockDeliveries(): Delivery[] {
  return [
    {
      id: 'DEL-001',
      orderId: 'ORD-2024-001',
      orderReference: 'CMD-2024-001',
      status: 'arriving_soon',
      eta: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '10:00',
      carrier: {
        id: 'CAR-001',
        name: 'Transport Express',
        contact: '+33 6 12 34 56 78',
      },
      origin: {
        name: 'Entrepôt Central Paris',
        address: '123 Rue de la Logistique',
        city: 'Paris',
      },
      destination: {
        id: 'DEST-001',
        name: 'Entrepôt Principal',
        address: '456 Avenue du Commerce',
        city: 'Lyon',
      },
      items: [
        {
          id: 'ITEM-001',
          productCode: 'PROD-001',
          productName: 'Pièces Automobiles Standard',
          quantity: 500,
          pallets: 5,
          weight: 2500,
        },
      ],
      totalPallets: 5,
      totalWeight: 2500,
      notes: 'Livraison urgente - Prioritaire',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'DEL-002',
      orderId: 'ORD-2024-002',
      orderReference: 'CMD-2024-002',
      status: 'confirmed',
      eta: null,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '14:30',
      carrier: {
        id: 'CAR-002',
        name: 'Logistics Pro',
      },
      origin: {
        name: 'Fournisseur Sud',
        address: '789 Route Industrielle',
        city: 'Marseille',
      },
      destination: {
        id: 'DEST-001',
        name: 'Entrepôt Principal',
        address: '456 Avenue du Commerce',
        city: 'Lyon',
      },
      items: [
        {
          id: 'ITEM-002',
          productCode: 'PROD-002',
          productName: 'Composants Électroniques',
          quantity: 200,
          pallets: 2,
          weight: 800,
        },
        {
          id: 'ITEM-003',
          productCode: 'PROD-003',
          productName: 'Câblage Premium',
          quantity: 100,
          pallets: 1,
          weight: 400,
        },
      ],
      totalPallets: 3,
      totalWeight: 1200,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-2024-003',
      orderReference: 'CMD-2024-003',
      status: 'in_transit',
      eta: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1h30
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '16:00',
      carrier: {
        id: 'CAR-003',
        name: 'Speed Cargo',
        contact: '+33 6 98 76 54 32',
      },
      origin: {
        name: 'Centre Distribution Lille',
        address: '321 Boulevard Logistique',
        city: 'Lille',
      },
      destination: {
        id: 'DEST-001',
        name: 'Entrepôt Principal',
        address: '456 Avenue du Commerce',
        city: 'Lyon',
      },
      items: [
        {
          id: 'ITEM-004',
          productCode: 'PROD-004',
          productName: 'Matériaux de Construction',
          quantity: 1000,
          pallets: 10,
          weight: 5000,
        },
      ],
      totalPallets: 10,
      totalWeight: 5000,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}
