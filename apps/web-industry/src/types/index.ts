// Order Types
export type OrderStatus =
  | 'NEW'
  | 'DISPATCHED'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'ESCALATED_AFFRETIA';

export interface TimeWindow {
  start: string;
  end: string;
}

export interface Location {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  ref: string;
  ownerOrgId: string;
  status: OrderStatus;
  ship_from: Location;
  ship_to: Location;
  windows?: {
    pickup?: TimeWindow;
    delivery?: TimeWindow;
  };
  pallets: number;
  weight: number;
  assignedCarrierId?: string;
  escalatedToAffretia?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderImport {
  id: string;
  ref?: string;
  ownerOrgId?: string;
  ship_from: Location;
  ship_to: Location;
  windows?: {
    pickup?: TimeWindow;
    delivery?: TimeWindow;
  };
  pallets: number;
  weight: number;
}

// Grid Types
export type GridMode = 'FTL' | 'LTL';

export interface Origin {
  id: string;
  ownerOrgId: string;
  label: string;
  country: string | null;
  city: string | null;
}

export interface FTLGridLine {
  origin: string;
  to: string;
  price: number;
  currency: string;
}

export interface LTLGridLine {
  origin: string;
  to: string;
  minPallets: number;
  maxPallets: number;
  pricePerPallet: number;
  currency: string;
}

export type GridLine = FTLGridLine | LTLGridLine;

export interface Grid {
  ownerOrgId: string;
  origin: string;
  mode: GridMode;
  lines: GridLine[];
}

// Carrier Types
export type VigilanceStatus = 'OK' | 'WARNING' | 'BLOCKED' | 'UNKNOWN';

export interface Carrier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vigilanceStatus?: VigilanceStatus;
  score?: number;
}

export interface CarrierInvitation {
  carrierId: string;
  industryOrgId: string;
  invitedAt: string;
  invitedBy?: string;
}

// Dispatch Types
export interface DispatchPolicy {
  orderId: string;
  chain: string[];
  slaAcceptHours: number;
}

export interface DispatchState {
  orderId: string;
  assignedCarrierId: string;
  expiresAt: number;
  status: OrderStatus;
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  acceptanceRate: number;
  avgResponseTime: number;
}

// API Response Types
export interface ApiResponse<T> {
  items?: T[];
  ok?: boolean;
  error?: string;
  detail?: string;
  traceId?: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  pageSize: number;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  type: 'INDUSTRY' | 'TRANSPORTER' | 'FORWARDER' | 'SUPPLIER' | 'RECIPIENT';
  email?: string;
  phone?: string;
  address?: string;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  features?: string[];
  addons?: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
}

// Form Types
export interface OrderImportFormData {
  file?: File;
  data?: OrderImport[];
}

export interface GridUploadFormData {
  mode: GridMode;
  origin: string;
  file?: File;
  ownerOrgId: string;
}

export interface OriginFormData {
  id: string;
  label: string;
  country?: string;
  city?: string;
  ownerOrgId: string;
}

export interface InviteCarrierFormData {
  email: string;
  name?: string;
  message?: string;
}
