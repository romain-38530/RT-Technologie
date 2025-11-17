export interface Pickup {
  id: string
  orderId: string
  status: 'scheduled' | 'confirmed' | 'in_preparation' | 'ready' | 'picked_up' | 'cancelled'
  scheduledDate: string
  confirmedDate?: string
  actualDate?: string
  carrier: {
    id: string
    name: string
    contact?: string
  }
  origin: {
    name: string
    address: string
    city: string
    zipCode: string
  }
  items: PickupItem[]
  slotId?: string
  slot?: TimeSlot
  documents?: Document[]
  createdAt: string
  updatedAt: string
}

export interface PickupItem {
  id: string
  sku: string
  description: string
  quantity: number
  weight?: number
  pallets?: number
}

export interface TimeSlot {
  id: string
  pickupId: string
  date: string
  startTime: string
  endTime: string
  status: 'proposed' | 'confirmed' | 'rejected'
  proposedBy: 'supplier' | 'carrier'
  confirmedAt?: string
  createdAt: string
}

export interface Document {
  id: string
  pickupId: string
  type: 'bl' | 'packing_list' | 'cmr' | 'photo' | 'other'
  name: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface PreparationChecklist {
  pickupId: string
  items: ChecklistItem[]
  completedAt?: string
}

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
  completedAt?: string
}

export interface KPI {
  totalPickups: number
  onTimePickups: number
  delayedPickups: number
  cancelledPickups: number
  averagePreparationTime: number
  complianceRate: number
  period: {
    start: string
    end: string
  }
}

export interface Notification {
  id: string
  type: 'pickup_scheduled' | 'pickup_imminent' | 'slot_confirmed' | 'slot_rejected' | 'document_required'
  title: string
  message: string
  pickupId?: string
  read: boolean
  createdAt: string
}
