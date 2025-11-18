import { apiFetch, getAuthToken } from './client'

const STORAGE_API_URL = process.env.NEXT_PUBLIC_STORAGE_MARKET_API_URL || 'http://localhost:3013'

// ============================================
// TYPES
// ============================================

export interface StorageNeed {
  id: string
  status: 'DRAFT' | 'PUBLISHED' | 'CONTRACTED' | 'COMPLETED' | 'CANCELLED'
  ownerOrgId: string
  storageType: 'long_term' | 'short_term' | 'seasonal' | 'project'
  volume: {
    type: 'palettes' | 'sqm' | 'cbm'
    quantity: number
  }
  duration: {
    startDate: string
    endDate?: string
    flexible?: boolean
    renewable?: boolean
  }
  location: {
    region?: string
    department?: string
    city?: string
    maxRadius?: number
    lat?: number
    lon?: number
  }
  constraints?: {
    temperature?: string
    adrAuthorized?: boolean
    securityLevel?: string
    certifications?: string[]
  }
  infrastructure?: {
    dockCount?: number
    liftingEquipment?: boolean
    handlingEquipment?: string[]
  }
  activity?: {
    schedule?: string
    dailyMovements?: number
  }
  budget?: {
    indicative?: number
    currency?: string
    period?: string
  }
  deadline?: string
  publicationType: 'GLOBAL' | 'REFERRED_ONLY' | 'MIXED'
  referredLogisticians?: string[]
  createdAt: string
  updatedAt?: string
  offersCount?: number
  contractId?: string
}

export interface StorageOffer {
  id: string
  needId: string
  logisticianId: string
  logisticianName: string
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'
  siteId: string
  siteName: string
  siteLocation: {
    address: string
    city: string
    lat: number
    lon: number
  }
  pricing: {
    monthlyRate?: number
    setupFee?: number
    handlingRate?: number
    totalPrice?: number
    currency: string
  }
  capacity: {
    available: number
    total: number
    unit: string
  }
  services: string[]
  certifications: string[]
  wmsIntegration?: boolean
  reliabilityScore?: number
  responseTimeHours?: number
  message?: string
  documents?: {
    name: string
    url: string
    type: string
  }[]
  createdAt: string
  // AI Ranking fields
  aiScore?: number
  aiRank?: number
  aiRecommended?: boolean
  aiReasons?: string[]
}

export interface StorageContract {
  id: string
  needId: string
  offerId: string
  industrialId: string
  logisticianId: string
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'COMPLETED' | 'TERMINATED'
  startDate: string
  endDate?: string
  terms: {
    pricing: any
    services: string[]
    sla: any
  }
  wmsConnected?: boolean
  createdAt: string
  updatedAt?: string
}

export interface RankedOffersResponse {
  items: StorageOffer[]
  top3: StorageOffer[]
}

// ============================================
// STORAGE NEEDS API
// ============================================

export async function createNeed(data: Partial<StorageNeed>): Promise<StorageNeed> {
  const token = getAuthToken()
  const response = await apiFetch<{ need: StorageNeed }>(
    `${STORAGE_API_URL}/storage-market/needs/create`,
    {
      method: 'POST',
      body: JSON.stringify(data),
      token: token || undefined,
    }
  )
  return response.need
}

export async function getNeeds(filters?: {
  ownerOrgId?: string
  status?: string
  publicationType?: string
}): Promise<StorageNeed[]> {
  const token = getAuthToken()
  const params = new URLSearchParams()
  if (filters?.ownerOrgId) params.set('ownerOrgId', filters.ownerOrgId)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.publicationType) params.set('publicationType', filters.publicationType)

  const queryString = params.toString()
  const url = queryString
    ? `${STORAGE_API_URL}/storage-market/needs?${queryString}`
    : `${STORAGE_API_URL}/storage-market/needs`

  const response = await apiFetch<{ items: StorageNeed[] }>(url, {
    token: token || undefined,
  })
  return response.items
}

export async function getNeed(id: string): Promise<StorageNeed> {
  const token = getAuthToken()
  const response = await apiFetch<{ need: StorageNeed }>(
    `${STORAGE_API_URL}/storage-market/needs/${id}`,
    {
      token: token || undefined,
    }
  )
  return response.need
}

export async function updateNeed(id: string, data: Partial<StorageNeed>): Promise<StorageNeed> {
  const token = getAuthToken()
  const response = await apiFetch<{ need: StorageNeed }>(
    `${STORAGE_API_URL}/storage-market/needs/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
      token: token || undefined,
    }
  )
  return response.need
}

export async function deleteNeed(id: string): Promise<void> {
  const token = getAuthToken()
  await apiFetch<{ deleted: boolean }>(
    `${STORAGE_API_URL}/storage-market/needs/${id}`,
    {
      method: 'DELETE',
      token: token || undefined,
    }
  )
}

// ============================================
// OFFERS API
// ============================================

export async function getOffers(needId: string): Promise<StorageOffer[]> {
  const token = getAuthToken()
  const response = await apiFetch<{ items: StorageOffer[] }>(
    `${STORAGE_API_URL}/storage-market/offers/${needId}`,
    {
      token: token || undefined,
    }
  )
  return response.items
}

export async function getRankedOffers(needId: string): Promise<RankedOffersResponse> {
  const token = getAuthToken()
  const response = await apiFetch<RankedOffersResponse>(
    `${STORAGE_API_URL}/storage-market/offers/ranking`,
    {
      method: 'POST',
      body: JSON.stringify({ needId }),
      token: token || undefined,
    }
  )
  return response
}

// ============================================
// CONTRACTS API
// ============================================

export async function selectOffer(needId: string, offerId: string): Promise<StorageContract> {
  const token = getAuthToken()
  const response = await apiFetch<{ contract: StorageContract }>(
    `${STORAGE_API_URL}/storage-market/contracts/create`,
    {
      method: 'POST',
      body: JSON.stringify({ needId, offerId }),
      token: token || undefined,
    }
  )
  return response.contract
}

export async function getContracts(filters?: {
  industrialId?: string
  status?: string
}): Promise<StorageContract[]> {
  const token = getAuthToken()
  const params = new URLSearchParams()
  if (filters?.industrialId) params.set('industrialId', filters.industrialId)
  if (filters?.status) params.set('status', filters.status)

  const queryString = params.toString()
  const url = queryString
    ? `${STORAGE_API_URL}/storage-market/contracts?${queryString}`
    : `${STORAGE_API_URL}/storage-market/contracts`

  const response = await apiFetch<{ items: StorageContract[] }>(url, {
    token: token || undefined,
  })
  return response.items
}

export async function getContract(id: string): Promise<StorageContract> {
  const token = getAuthToken()
  const response = await apiFetch<{ contract: StorageContract }>(
    `${STORAGE_API_URL}/storage-market/contracts/${id}`,
    {
      token: token || undefined,
    }
  )
  return response.contract
}

export async function updateContractStatus(
  id: string,
  status: StorageContract['status']
): Promise<StorageContract> {
  const token = getAuthToken()
  const response = await apiFetch<{ contract: StorageContract }>(
    `${STORAGE_API_URL}/storage-market/contracts/${id}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
      token: token || undefined,
    }
  )
  return response.contract
}

// ============================================
// WMS INTEGRATION API
// ============================================

export interface WMSInventory {
  contractId: string
  lastUpdate: string
  totalPallets: number
  availableSpace: number
  items: {
    sku: string
    quantity: number
    location: string
  }[]
}

export interface WMSMovements {
  contractId: string
  period: {
    from: string
    to: string
  }
  items: {
    date: string
    type: 'IN' | 'OUT'
    sku: string
    quantity: number
    ref: string
  }[]
}

export async function getWMSInventory(contractId: string): Promise<WMSInventory> {
  const token = getAuthToken()
  const response = await apiFetch<{ inventory: WMSInventory }>(
    `${STORAGE_API_URL}/storage-market/wms/inventory/${contractId}`,
    {
      token: token || undefined,
    }
  )
  return response.inventory
}

export async function getWMSMovements(
  contractId: string,
  from?: string,
  to?: string
): Promise<WMSMovements> {
  const token = getAuthToken()
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const queryString = params.toString()
  const url = queryString
    ? `${STORAGE_API_URL}/storage-market/wms/movements/${contractId}?${queryString}`
    : `${STORAGE_API_URL}/storage-market/wms/movements/${contractId}`

  const response = await apiFetch<{ movements: WMSMovements }>(url, {
    token: token || undefined,
  })
  return response.movements
}
