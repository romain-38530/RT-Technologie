import { apiFetch, getAuthToken } from './client'

// Base URL for palette service
const PALETTE_API_URL = process.env.NEXT_PUBLIC_PALETTE_API_URL || 'http://localhost:3011'

// Types for Palette module (matching server.js structure)
export interface PalletCheque {
  id: string
  orderId: string
  fromCompanyId: string
  toSiteId: string
  quantity: number
  palletType: string
  transporterPlate: string
  qrCode: string
  status: 'EMIS' | 'DEPOSE' | 'RECU' | 'LITIGE'
  createdAt: string
  depositedAt: string | null
  receivedAt: string | null
  signatures: {
    transporter: string | null
    receiver: string | null
  }
  photos: Array<{ type: string; url: string; at: string }>
  geolocations: {
    deposit: { lat: number; lng: number } | null
    receipt: { lat: number; lng: number } | null
  }
  cryptoSignature: string
  quantityReceived?: number
}

export interface PalletSite {
  id: string
  companyId: string
  name: string
  address: string
  gps: { lat: number; lng: number }
  quotaDailyMax: number
  quotaConsumed: number
  openingHours: { start: string; end: string }
  availableDays: number[]
  priority: 'INTERNAL' | 'NETWORK' | 'EXTERNAL'
}

export interface PalletLedger {
  companyId: string
  balance: number
  history: Array<{
    date: string
    delta: number
    reason: string
    chequeId: string | null
    newBalance: number
  }>
}

export interface SiteMatchRequest {
  deliveryLocation: { lat: number; lng: number }
  companyId: string
}

export interface SiteMatchResponse {
  bestSite: {
    siteId: string
    site: PalletSite
    distance: number
    quotaRemaining: number
    priorityScore: number
    score: number
  }
  alternatives: Array<{
    siteId: string
    site: PalletSite
    distance: number
    quotaRemaining: number
    priorityScore: number
    score: number
  }>
}

export interface GenerateChequeRequest {
  fromCompanyId: string
  orderId: string
  quantity: number
  transporterPlate?: string
  deliveryLocation: { lat: number; lng: number }
}

export interface GenerateChequeResponse {
  cheque: PalletCheque
  matchedSite: {
    siteId: string
    site: PalletSite
    distance: number
    quotaRemaining: number
    priorityScore: number
    score: number
  }
  alternatives: Array<{
    siteId: string
    site: PalletSite
    distance: number
    quotaRemaining: number
    priorityScore: number
    score: number
  }>
  traceId: string | null
}

// Helper function to call palette API
async function paletteFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  }

  const url = `${PALETTE_API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const palettesApi = {
  // Generate pallet cheque with AI site matching
  generateCheque: async (data: GenerateChequeRequest): Promise<GenerateChequeResponse> => {
    return paletteFetch<GenerateChequeResponse>('/palette/cheques/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Get cheque details
  getCheque: async (chequeId: string): Promise<PalletCheque> => {
    const response = await paletteFetch<{ cheque: PalletCheque }>(`/palette/cheques/${chequeId}`)
    return response.cheque
  },

  // Get company pallet balance
  getLedger: async (companyId: string): Promise<PalletLedger> => {
    const response = await paletteFetch<{ ledger: PalletLedger }>(`/palette/ledger/${companyId}`)
    return response.ledger
  },

  // Get all return sites
  getSites: async (): Promise<PalletSite[]> => {
    const response = await paletteFetch<{ sites: PalletSite[] }>('/palette/sites')
    return response.sites
  },

  // AI-powered site matching
  matchSite: async (data: SiteMatchRequest): Promise<SiteMatchResponse> => {
    return paletteFetch<SiteMatchResponse>('/palette/match/site', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update site quota
  updateSiteQuota: async (siteId: string, quotaDailyMax: number): Promise<{ quota: any }> => {
    return paletteFetch<{ quota: any }>(`/palette/sites/${siteId}/quota`, {
      method: 'POST',
      body: JSON.stringify({ dailyMax: quotaDailyMax }),
    })
  },

  // Create dispute
  createDispute: async (data: {
    chequeId: string
    claimantId: string
    reason: string
    photos?: string[]
    comments?: string
  }): Promise<{ dispute: any }> => {
    return paletteFetch<{ dispute: any }>('/palette/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
