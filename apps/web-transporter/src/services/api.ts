import { getToken } from '@/lib/auth';

export interface Mission {
  id: string;
  ref: string;
  expiresAt?: number | null;
  ship_from?: string;
  ship_to?: string;
  pallets?: number;
  weight?: number;
}

export interface RDVSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface DocumentUpload {
  file: File;
  orderId: string;
  type: 'CMR' | 'PHOTO' | 'POD';
}

const API_BASE = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Orders API
export async function getPendingMissions(carrierId: string): Promise<{ items: Mission[] }> {
  return fetchWithAuth(`${API_BASE}/orders?carrierId=${encodeURIComponent(carrierId)}&status=pending`);
}

export async function getAcceptedMissions(carrierId: string): Promise<{ items: Mission[] }> {
  return fetchWithAuth(`${API_BASE}/orders?carrierId=${encodeURIComponent(carrierId)}&status=accepted`);
}

export async function acceptMission(orderId: string, carrierId: string): Promise<any> {
  return fetchWithAuth(`${API_BASE}/orders/${orderId}/accept`, {
    method: 'POST',
    body: JSON.stringify({ carrierId }),
  });
}

export async function refuseMission(orderId: string, carrierId: string): Promise<any> {
  // For now, we don't have a refuse endpoint, so we just don't accept
  // In a real system, this would notify the backend
  return { ok: true, refused: orderId };
}

// Planning API
export async function getSlots(date: string): Promise<{ slots: RDVSlot[] }> {
  return fetchWithAuth(`${API_BASE}/planning/slots?date=${encodeURIComponent(date)}`);
}

export async function proposeRDV(orderId: string, date: string, time: string): Promise<any> {
  return fetchWithAuth(`${API_BASE}/planning/rdv/propose`, {
    method: 'POST',
    body: JSON.stringify({ orderId, date, time }),
  });
}

// Documents API
export async function uploadDocument(upload: DocumentUpload): Promise<any> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', upload.file);
  formData.append('orderId', upload.orderId);
  formData.append('type', upload.type);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/ecpmr/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getDocuments(orderId: string): Promise<{ documents: any[] }> {
  return fetchWithAuth(`${API_BASE}/ecpmr/documents?orderId=${encodeURIComponent(orderId)}`);
}
