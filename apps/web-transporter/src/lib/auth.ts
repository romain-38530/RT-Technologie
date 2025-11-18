export interface JWTPayload {
  carrierId: string;
  name?: string;
  email?: string;
  exp?: number;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('transporter_jwt');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('transporter_jwt', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('transporter_jwt');
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
}

export function getCurrentCarrier(): JWTPayload | null {
  const token = getToken();
  if (!token || !isTokenValid(token)) return null;
  return decodeToken(token);
}
