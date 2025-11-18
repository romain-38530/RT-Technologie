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

  // Receive pallets (logistician confirms reception)
  receiveCheque: async (data: {
    chequeId: string;
    receiverSignature: string;
    geolocation: { lat: number; lng: number };
    photo?: string;
    quantityReceived?: number;
  }): Promise<{ cheque: PalletCheque }> => {
    return apiFetch<{ cheque: PalletCheque }>(`/palette/cheques/${data.chequeId}/receive`, {
      method: 'POST',
      body: JSON.stringify({
        receiverSignature: data.receiverSignature,
        geolocation: data.geolocation,
        photo: data.photo,
        quantityReceived: data.quantityReceived,
      }),
    });
  },

  // Get all return sites for this logistician
  getSites: async (): Promise<PalletSite[]> => {
    const response = await apiFetch<{ sites: PalletSite[] }>('/palette/sites');
    return response.sites;
  },

  // Get sites for a specific company
  getMySites: async (companyId: string): Promise<PalletSite[]> => {
    const response = await apiFetch<{ sites: PalletSite[] }>(`/palette/sites?companyId=${companyId}`);
    return response.sites;
  },

  // Update site quota
  updateSiteQuota: async (siteId: string, quotaDailyMax: number): Promise<{ quota: any }> => {
    return apiFetch<{ quota: any }>(`/palette/sites/${siteId}/quota`, {
      method: 'POST',
      body: JSON.stringify({ dailyMax: quotaDailyMax }),
    });
  },
};
