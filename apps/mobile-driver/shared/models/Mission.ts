export interface Mission {
  id: string;
  code: string;
  status: MissionStatus;
  driver: Driver;
  vehicle: Vehicle;
  loadingPoint: Location;
  deliveryPoint: Location;
  cargo: Cargo;
  documents: Document[];
  timestamps: Timestamps;
  tracking: TrackingInfo;
}

export enum MissionStatus {
  PENDING = 'PENDING',
  EN_ROUTE_TO_LOADING = 'EN_ROUTE_TO_LOADING',
  ARRIVED_LOADING = 'ARRIVED_LOADING',
  LOADED = 'LOADED',
  EN_ROUTE_TO_DELIVERY = 'EN_ROUTE_TO_DELIVERY',
  ARRIVED_DELIVERY = 'ARRIVED_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contacts: Contact[];
  instructions?: string;
  dockNumber?: string;
  photos?: string[];
  geofenceRadius?: number; // in meters
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
  email?: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  type: 'EMPLOYEE' | 'SUBCONTRACTOR';
  licenseNumber?: string;
}

export interface Vehicle {
  registration: string;
  trailerRegistration?: string;
  type: string;
  maxWeight?: number;
}

export interface Cargo {
  description: string;
  weight?: number;
  volume?: number;
  pallets?: number;
  dangerousGoods?: boolean;
  temperature?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
}

export interface Document {
  id: string;
  type: DocumentType;
  url?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  metadata?: {
    latitude?: number;
    longitude?: number;
    timestamp?: string;
  };
}

export enum DocumentType {
  CMR = 'CMR',
  BL = 'BL',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  CUSTOMS = 'CUSTOMS',
  PHOTO = 'PHOTO',
  SIGNATURE_LOADING = 'SIGNATURE_LOADING',
  SIGNATURE_DELIVERY = 'SIGNATURE_DELIVERY',
  DAMAGE_REPORT = 'DAMAGE_REPORT'
}

export interface Timestamps {
  created: string;
  scheduledLoadingStart?: string;
  scheduledLoadingEnd?: string;
  scheduledDeliveryStart?: string;
  scheduledDeliveryEnd?: string;
  actualLoadingStart?: string;
  actualLoadingEnd?: string;
  actualDeliveryStart?: string;
  actualDeliveryEnd?: string;
}

export interface TrackingInfo {
  currentPosition?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  eta?: {
    toLoading?: string;
    toDelivery?: string;
  };
  distance?: {
    toLoading?: number; // in meters
    toDelivery?: number; // in meters
  };
  lastUpdate?: string;
}

export interface Signature {
  id: string;
  missionId: string;
  type: 'LOADING' | 'DELIVERY';
  signatureData: string; // base64 encoded
  signerName: string;
  signerRole?: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  remarks?: string;
  photos?: string[];
}

export interface Reserve {
  id: string;
  missionId: string;
  description: string;
  photos: string[];
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  reportedBy: string;
}
