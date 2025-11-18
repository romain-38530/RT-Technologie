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

  // Deposit pallets (transporter delivers to site)
  depositCheque: async (data: {
    chequeId: string;
    gps: { lat: number; lng: number };
    photo?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/palette/cheques/${data.chequeId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({
        gps: data.gps,
        photo: data.photo,
      }),
    });
  },

  // Get all return sites
  getSites: async (): Promise<PalletSite[]> => {
    return apiFetch<PalletSite[]>('/palette/sites');
  },
};
