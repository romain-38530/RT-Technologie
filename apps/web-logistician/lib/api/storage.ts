const STORAGE_API_URL = process.env.NEXT_PUBLIC_STORAGE_MARKET_API_URL || 'http://localhost:3013';

// ============================================
// TYPES
// ============================================

export interface StorageNeed {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CONTRACTED' | 'COMPLETED' | 'CANCELLED';
  ownerOrgId: string;
  storageType: 'long_term' | 'short_term' | 'seasonal' | 'project';
  volume: {
    type: 'palettes' | 'sqm' | 'cbm';
    quantity: number;
  };
  duration: {
    startDate: string;
    endDate?: string;
    flexible?: boolean;
    renewable?: boolean;
  };
  location: {
    region?: string;
    department?: string;
    city?: string;
    maxRadius?: number;
    lat?: number;
    lon?: number;
  };
  constraints?: {
    temperature?: string;
    adrAuthorized?: boolean;
    securityLevel?: string;
    certifications?: string[];
  };
  infrastructure?: {
    dockCount?: number;
    liftingEquipment?: boolean;
    handlingEquipment?: string[];
  };
  activity?: {
    schedule?: string;
    dailyMovements?: number;
  };
  budget?: {
    indicative?: number;
    currency?: string;
    period?: string;
  };
  deadline?: string;
  publicationType: 'GLOBAL' | 'REFERRED_ONLY' | 'MIXED';
  referredLogisticians?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface LogisticianSite {
  id: string;
  logisticianId: string;
  name: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
    lat: number;
    lon: number;
  };
  capacity: {
    palettes: number;
    sqm: number;
    cbm: number;
  };
  available: {
    palettes: number;
    sqm: number;
    cbm: number;
  };
  features: {
    temperature?: string[];
    adrAuthorized?: boolean;
    securityLevel?: string;
    certifications?: string[];
    dockCount?: number;
    liftingEquipment?: boolean;
  };
  pricing?: {
    monthlyRatePallet?: number;
    monthlyRateSqm?: number;
    setupFee?: number;
    handlingRate?: number;
    currency?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'FULL';
  wmsIntegration?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StorageOffer {
  id: string;
  needId: string;
  logisticianId: string;
  logisticianName: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  siteId: string;
  siteName: string;
  siteLocation: {
    address: string;
    city: string;
    lat: number;
    lon: number;
  };
  pricing: {
    monthlyRate?: number;
    setupFee?: number;
    handlingRate?: number;
    totalPrice?: number;
    currency: string;
  };
  capacity: {
    available: number;
    total: number;
    unit: string;
  };
  services: string[];
  certifications: string[];
  wmsIntegration?: boolean;
  reliabilityScore?: number;
  responseTimeHours?: number;
  message?: string;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  createdAt: string;
}

export interface StorageContract {
  id: string;
  needId: string;
  offerId: string;
  industrialId: string;
  logisticianId: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'COMPLETED' | 'TERMINATED';
  startDate: string;
  endDate?: string;
  terms: {
    pricing: any;
    services: string[];
    sla: any;
  };
  wmsConnected?: boolean;
  createdAt: string;
  updatedAt?: string;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${STORAGE_API_URL}${endpoint}`, {
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

// ============================================
// STORAGE MARKET API
// ============================================

export const storageMarketApi = {
  // ============================================
  // AVAILABLE NEEDS (Marketplace)
  // ============================================

  /**
   * Get all available storage needs (published, not yet contracted)
   */
  getAvailableNeeds: async (filters?: {
    status?: string;
    publicationType?: string;
  }): Promise<StorageNeed[]> => {
    const params = new URLSearchParams();
    params.set('status', filters?.status || 'PUBLISHED');
    if (filters?.publicationType) {
      params.set('publicationType', filters.publicationType);
    }

    const response = await apiFetch<{ items: StorageNeed[] }>(
      `/storage-market/needs?${params.toString()}`
    );
    return response.items;
  },

  /**
   * Get specific need details
   */
  getNeed: async (needId: string): Promise<StorageNeed> => {
    const response = await apiFetch<{ need: StorageNeed }>(
      `/storage-market/needs/${needId}`
    );
    return response.need;
  },

  // ============================================
  // OFFERS SUBMISSION
  // ============================================

  /**
   * Submit an offer for a storage need
   */
  submitOffer: async (data: {
    needId: string;
    logisticianId: string;
    siteId: string;
    siteName: string;
    siteLocation: {
      address: string;
      city: string;
      lat: number;
      lon: number;
    };
    pricing: {
      monthlyRate?: number;
      setupFee?: number;
      handlingRate?: number;
      totalPrice?: number;
      currency: string;
    };
    capacity: {
      available: number;
      total: number;
      unit: string;
    };
    services: string[];
    certifications: string[];
    wmsIntegration?: boolean;
    reliabilityScore?: number;
    message?: string;
    documents?: {
      name: string;
      url: string;
      type: string;
    }[];
  }): Promise<StorageOffer> => {
    const response = await apiFetch<{ offer: StorageOffer }>(
      '/storage-market/offers/send',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.offer;
  },

  // ============================================
  // LOGISTICIAN SITES & CAPACITY
  // ============================================

  /**
   * Get all sites for the logistician
   */
  getMySites: async (logisticianId: string): Promise<LogisticianSite[]> => {
    const response = await apiFetch<{ items: LogisticianSite[] }>(
      `/storage-market/logistician-capacity/${logisticianId}`
    );
    return response.items;
  },

  /**
   * Create a new logistician site
   */
  createSite: async (data: Partial<LogisticianSite>): Promise<LogisticianSite> => {
    const response = await apiFetch<{ site: LogisticianSite }>(
      '/storage-market/logistician-capacity',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.site;
  },

  /**
   * Update site capacity and information
   */
  updateCapacity: async (
    siteId: string,
    data: Partial<LogisticianSite>
  ): Promise<LogisticianSite> => {
    const response = await apiFetch<{ site: LogisticianSite }>(
      `/storage-market/logistician-capacity/${siteId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.site;
  },

  // ============================================
  // CONTRACTS
  // ============================================

  /**
   * Get contracts for the logistician
   */
  getMyContracts: async (logisticianId: string, status?: string): Promise<StorageContract[]> => {
    const params = new URLSearchParams();
    params.set('logisticianId', logisticianId);
    if (status) {
      params.set('status', status);
    }

    const response = await apiFetch<{ items: StorageContract[] }>(
      `/storage-market/contracts?${params.toString()}`
    );
    return response.items;
  },

  /**
   * Get specific contract details
   */
  getContract: async (contractId: string): Promise<StorageContract> => {
    const response = await apiFetch<{ contract: StorageContract }>(
      `/storage-market/contracts/${contractId}`
    );
    return response.contract;
  },

  /**
   * Update contract status
   */
  updateContractStatus: async (
    contractId: string,
    status: StorageContract['status']
  ): Promise<StorageContract> => {
    const response = await apiFetch<{ contract: StorageContract }>(
      `/storage-market/contracts/${contractId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
    return response.contract;
  },

  // ============================================
  // WMS INTEGRATION
  // ============================================

  /**
   * Connect WMS for a contract
   */
  connectWMS: async (data: {
    contractId: string;
    wmsType: string;
    credentials: any;
  }): Promise<{ connection: any }> => {
    return apiFetch<{ connection: any }>('/storage-market/wms/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get inventory for a contract
   */
  getInventory: async (contractId: string): Promise<any> => {
    const response = await apiFetch<{ inventory: any }>(
      `/storage-market/wms/inventory/${contractId}`
    );
    return response.inventory;
  },

  /**
   * Get movements for a contract
   */
  getMovements: async (contractId: string, from?: string, to?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const queryString = params.toString();
    const url = queryString
      ? `/storage-market/wms/movements/${contractId}?${queryString}`
      : `/storage-market/wms/movements/${contractId}`;

    const response = await apiFetch<{ movements: any }>(url);
    return response.movements;
  },
};
