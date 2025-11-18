const AFFRET_IA_URL = process.env.NEXT_PUBLIC_AFFRET_IA_URL || 'http://localhost:3005';

export interface Quote {
  orderId: string;
  price: number;
  currency: string;
  suggestedCarriers: string[];
  priceRef?: {
    price: number;
    currency: string;
    mode: string;
  };
}

export interface Bid {
  carrierId: string;
  price: number;
  currency: string;
  scoring: number | null;
  at: string;
}

export interface Assignment {
  orderId: string;
  carrierId: string;
  price: number;
  currency: string;
  at: string;
  source: string;
  priceRef?: {
    price: number;
    currency: string;
    mode: string;
  };
}

export interface Carrier {
  id: string;
  name: string;
  email: string;
  vat: string;
  blocked: boolean;
  scoring: number;
  premium: boolean;
}

export interface Order {
  id: string;
  ref: string;
  ownerOrgId: string;
  ship_from: string;
  ship_to: string;
  origin?: string;
  windows: {
    start: string;
    end: string;
  };
  pallets: number;
  weight: number;
  status: string;
  forceEscalation?: boolean;
}

async function apiCall(endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('forwarder_jwt') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${AFFRET_IA_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getQuote(orderId: string): Promise<Quote> {
  return apiCall(`/affret-ia/quote/${orderId}`);
}

export async function getBids(orderId: string): Promise<{ orderId: string; bids: Bid[] }> {
  return apiCall(`/affret-ia/bids/${orderId}`);
}

export async function getAssignment(orderId: string): Promise<{ orderId: string; assignment: Assignment | null }> {
  return apiCall(`/affret-ia/assignment/${orderId}`);
}

export async function submitBid(orderId: string, carrierId: string, price: number, currency = 'EUR') {
  return apiCall('/affret-ia/bid', {
    method: 'POST',
    body: JSON.stringify({ orderId, carrierId, price, currency }),
  });
}

export async function dispatchOrder(orderId: string) {
  return apiCall('/affret-ia/dispatch', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

// Helper pour charger les seeds (en dev, on peut les charger directement)
export async function loadOrders(): Promise<Order[]> {
  try {
    const response = await fetch('/seeds/orders.json');
    return response.json();
  } catch {
    return [];
  }
}

export async function loadCarriers(): Promise<Carrier[]> {
  try {
    const response = await fetch('/seeds/carriers.json');
    return response.json();
  } catch {
    return [];
  }
}
