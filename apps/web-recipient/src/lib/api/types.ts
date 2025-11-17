export interface Delivery {
  id: string
  orderId: string
  orderReference: string
  status: DeliveryStatus
  eta: string | null
  scheduledDate: string
  scheduledTime: string | null
  carrier: {
    id: string
    name: string
    contact?: string
  }
  origin: {
    name: string
    address: string
    city: string
  }
  destination: {
    id: string
    name: string
    address: string
    city: string
  }
  items: DeliveryItem[]
  totalPallets: number
  totalWeight: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryItem {
  id: string
  productCode: string
  productName: string
  quantity: number
  pallets: number
  weight: number
}

export type DeliveryStatus =
  | 'scheduled'      // Planifiée
  | 'confirmed'      // Confirmée
  | 'in_transit'     // En transit
  | 'arriving_soon'  // Arrivée imminente
  | 'delivered'      // Livrée
  | 'cancelled'      // Annulée
  | 'delayed'        // Retardée

export interface TimeSlot {
  id: string
  deliveryId: string
  date: string
  startTime: string
  endTime: string
  status: 'available' | 'proposed' | 'confirmed' | 'occupied'
  recipientId: string
  notes?: string
}

export interface Reception {
  id: string
  deliveryId: string
  receivedAt: string
  receivedBy: string
  items: ReceptionItem[]
  signature?: string
  signedBy?: string
  signedAt?: string
  photos?: string[]
  notes?: string
  status: 'pending' | 'in_progress' | 'completed' | 'with_anomalies'
}

export interface ReceptionItem {
  deliveryItemId: string
  productCode: string
  productName: string
  expectedQuantity: number
  expectedPallets: number
  receivedQuantity: number
  receivedPallets: number
  condition: 'good' | 'damaged' | 'missing'
  notes?: string
}

export interface Anomaly {
  id: string
  receptionId: string
  deliveryId: string
  orderId: string
  type: AnomalyType
  severity: 'minor' | 'major' | 'critical'
  status: 'reported' | 'acknowledged' | 'in_review' | 'resolved' | 'closed'
  description: string
  items: AnomalyItem[]
  photos: string[]
  reportedBy: string
  reportedAt: string
  resolution?: string
  resolvedAt?: string
  resolvedBy?: string
}

export type AnomalyType =
  | 'damaged_goods'
  | 'missing_items'
  | 'wrong_items'
  | 'quantity_mismatch'
  | 'quality_issue'
  | 'packaging_issue'

export interface AnomalyItem {
  productCode: string
  productName: string
  expectedQuantity: number
  receivedQuantity: number
  issue: string
}

export interface CMRSignature {
  id: string
  deliveryId: string
  receptionId: string
  signatureData: string // Base64 encoded signature
  signedBy: string
  signedByRole: 'recipient' | 'driver'
  signedAt: string
  ipAddress?: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface Statistics {
  period: string
  totalDeliveries: number
  onTimeDeliveries: number
  lateDeliveries: number
  withAnomalies: number
  averageDelay: number // in minutes
  conformityRate: number // percentage
  topCarriers: Array<{
    name: string
    deliveries: number
    onTimeRate: number
  }>
}
