const PALETTE_API_URL = process.env.NEXT_PUBLIC_PALETTE_API_URL || 'http://localhost:3011';

export interface PalletCheque {
  id: string;
  orderId: string;
  fromCompanyId: string;
  toSiteId: string;
  quantity: number;
  palletType: string;
  transporterPlate: string;
  qrCode: string;
  status: 'EMIS' | 'DEPOSE' | 'RECU' | 'LITIGE';
  createdAt: string;
  depositedAt: string | null;
  receivedAt: string | null;
  signatures: {
    transporter: string | null;
    receiver: string | null;
  };
  photos: Array<{ type: string; url: string; at: string }>;
  geolocations: {
    deposit: { lat: number; lng: number } | null;
    receipt: { lat: number; lng: number } | null;
  };
  cryptoSignature: string;
  quantityReceived?: number;
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
    const response = await apiFetch<{ cheque: PalletCheque }>(`/palette/cheques/${chequeId}`);
    return response.cheque;
  },

  // Deposit pallets (transporter delivers to site)
  depositCheque: async (data: {
    chequeId: string;
    transporterSignature: string;
    geolocation: { lat: number; lng: number };
    photo?: string;
  }): Promise<{ cheque: PalletCheque }> => {
    return apiFetch<{ cheque: PalletCheque }>(`/palette/cheques/${data.chequeId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({
        transporterSignature: data.transporterSignature,
        geolocation: data.geolocation,
        photo: data.photo,
      }),
    });
  },

  // Get all return sites
  getSites: async (): Promise<PalletSite[]> => {
    const response = await apiFetch<{ sites: PalletSite[] }>('/palette/sites');
    return response.sites;
  },

  // AI-powered site matching
  matchSite: async (data: {
    deliveryLocation: { lat: number; lng: number };
    companyId?: string;
  }): Promise<any> => {
    return apiFetch<any>('/palette/match/site', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
