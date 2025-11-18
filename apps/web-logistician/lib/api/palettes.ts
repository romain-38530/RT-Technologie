const PALETTE_API_URL = process.env.NEXT_PUBLIC_PALETTE_API_URL || 'http://localhost:3011';

export interface PalletCheque {
  chequeId: string;
  fromCompanyId: string;
  toSiteId: string;
  orderId: string;
  quantity: number;
  transporterPlate: string;
  qrCode: string;
  signature: string;
  createdAt: string;
  status: 'GENERATED' | 'DEPOSITED' | 'RECEIVED' | 'DISPUTED';
  depositedAt?: string;
  receivedAt?: string;
  depositGps?: { lat: number; lng: number };
  receiveGps?: { lat: number; lng: number };
  depositPhoto?: string;
  receivePhoto?: string;
}

export interface PalletSite {
  id: string;
  companyId: string;
  name: string;
  address: string;
  gps: { lat: number; lng: number };
  quotaDailyMax: number;
  quotaConsumed: number;
  openingHours: { start: string; end: string };
  availableDays: number[];
  priority: 'INTERNAL' | 'NETWORK' | 'EXTERNAL';
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${PALETTE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API error');
  }

  return response.json();
}

export const palettesApi = {
  // Get cheque details
  getCheque: async (chequeId: string): Promise<PalletCheque> => {
    return apiFetch<PalletCheque>(`/palette/cheques/${chequeId}`);
  },

  // Receive pallets (logistician confirms reception)
  receiveCheque: async (data: {
    chequeId: string;
    gps: { lat: number; lng: number };
    photo?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/palette/cheques/${data.chequeId}/receive`, {
      method: 'POST',
      body: JSON.stringify({
        gps: data.gps,
        photo: data.photo,
      }),
    });
  },

  // Get all return sites for this logistician
  getSites: async (): Promise<PalletSite[]> => {
    return apiFetch<PalletSite[]>('/palette/sites');
  },

  // Update site quota
  updateSiteQuota: async (siteId: string, quotaDailyMax: number): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/palette/sites/${siteId}/quota`, {
      method: 'POST',
      body: JSON.stringify({ quotaDailyMax }),
    });
  },
};
