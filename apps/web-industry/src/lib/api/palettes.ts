import { apiFetch, getAuthToken } from './client'

// Types for Palette module
export interface PalletCheque {
  chequeId: string
  fromCompanyId: string
  toSiteId: string
  orderId: string
  quantity: number
  transporterPlate: string
  qrCode: string
  signature: string
  createdAt: string
  status: 'GENERATED' | 'DEPOSITED' | 'RECEIVED' | 'DISPUTED'
  depositedAt?: string
  receivedAt?: string
  depositGps?: { lat: number; lng: number }
  receiveGps?: { lat: number; lng: number }
  depositPhoto?: string
  receivePhoto?: string
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
  quantity: number
  deliveryDate?: string
}

export interface SiteMatchResponse {
  bestSite: PalletSite & { distance: number; quotaAvailable: number }
  alternatives: Array<PalletSite & { distance: number; quotaAvailable: number }>
  aiRecommendation: string
}

export interface GenerateChequeRequest {
  fromCompanyId: string
  orderId: string
  quantity: number
  transporterPlate: string
  deliveryLocation: { lat: number; lng: number }
}

export interface GenerateChequeResponse {
  cheque: PalletCheque
  matchedSite: PalletSite & { distance: number }
  aiRecommendation: string
}

export const palettesApi = {
  // Generate pallet cheque with AI site matching
  generateCheque: async (data: GenerateChequeRequest): Promise<GenerateChequeResponse> => {
    return apiFetch<GenerateChequeResponse>('/palette/cheques/generate', {
      method: 'POST',
      body: JSON.stringify(data),
      token: getAuthToken() || undefined,
    })
  },

  // Get cheque details
  getCheque: async (chequeId: string): Promise<PalletCheque> => {
    return apiFetch<PalletCheque>(`/palette/cheques/${chequeId}`, {
      token: getAuthToken() || undefined,
    })
  },

  // Get company pallet balance
  getLedger: async (companyId: string): Promise<PalletLedger> => {
    return apiFetch<PalletLedger>(`/palette/ledger/${companyId}`, {
      token: getAuthToken() || undefined,
    })
  },

  // Get all return sites
  getSites: async (): Promise<PalletSite[]> => {
    return apiFetch<PalletSite[]>('/palette/sites', {
      token: getAuthToken() || undefined,
    })
  },

  // AI-powered site matching
  matchSite: async (data: SiteMatchRequest): Promise<SiteMatchResponse> => {
    return apiFetch<SiteMatchResponse>('/palette/match/site', {
      method: 'POST',
      body: JSON.stringify(data),
      token: getAuthToken() || undefined,
    })
  },

  // Update site quota
  updateSiteQuota: async (siteId: string, quotaDailyMax: number): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/palette/sites/${siteId}/quota`, {
      method: 'POST',
      body: JSON.stringify({ quotaDailyMax }),
      token: getAuthToken() || undefined,
    })
  },

  // Create dispute
  createDispute: async (data: {
    chequeId: string
    reason: string
    photos?: string[]
  }): Promise<{ disputeId: string }> => {
    return apiFetch<{ disputeId: string }>('/palette/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
      token: getAuthToken() || undefined,
    })
  },
}
