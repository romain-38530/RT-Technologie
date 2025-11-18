import { apiClients } from './client'
import type { TimeSlot } from './types'

export async function getAvailableSlots(
  recipientId: string,
  date: string
): Promise<TimeSlot[]> {
  try {
    const response = await apiClients.planning.get(`/slots/available`, {
      params: { recipientId, date },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return getMockSlots(date)
  }
}

export async function proposeSlot(
  deliveryId: string,
  slotData: Partial<TimeSlot>
): Promise<TimeSlot> {
  try {
    const response = await apiClients.planning.post(`/slots/propose`, {
      deliveryId,
      ...slotData,
    })
    return response.data
  } catch (error) {
    console.error('Error proposing slot:', error)
    throw error
  }
}

export async function confirmSlot(slotId: string): Promise<TimeSlot> {
  try {
    const response = await apiClients.planning.patch(`/slots/${slotId}/confirm`)
    return response.data
  } catch (error) {
    console.error('Error confirming slot:', error)
    throw error
  }
}

export async function getDeliverySlots(deliveryId: string): Promise<TimeSlot[]> {
  try {
    const response = await apiClients.planning.get(`/slots/delivery/${deliveryId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching delivery slots:', error)
    return []
  }
}

// Mock data for development
function getMockSlots(date: string): TimeSlot[] {
  const baseSlots = [
    { startTime: '08:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
  ]

  return baseSlots.map((slot, index) => ({
    id: `SLOT-${index + 1}`,
    deliveryId: '',
    date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: index % 3 === 0 ? 'occupied' : 'available',
    recipientId: 'DEST-001',
  }))
}
