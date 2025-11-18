/**
 * RT Technologie - Mobile Driver PWA
 * Application Constants and Configuration
 */

// API Endpoints Configuration
export const API_ENDPOINTS = {
  CORE_ORDERS: process.env.NEXT_PUBLIC_CORE_ORDERS_API || 'http://localhost:3001',
  PLANNING: process.env.NEXT_PUBLIC_PLANNING_API || 'http://localhost:3004',
  ECMR: process.env.NEXT_PUBLIC_ECMR_API || 'http://localhost:3009',
  NOTIFICATIONS: process.env.NEXT_PUBLIC_NOTIFICATIONS_API || 'http://localhost:3002',
  GEO_TRACKING: process.env.NEXT_PUBLIC_GEO_TRACKING_URL || 'http://localhost:3016',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'rt_driver_auth_token',
  USER_DATA: 'rt_driver_user',
  OFFLINE_QUEUE: 'rt_driver_offline_queue',
  MISSION_DATA: 'rt_driver_mission',
  GPS_POSITIONS: 'rt_driver_gps_positions',
} as const;

// GPS Tracking Configuration
export const GPS_CONFIG = {
  // Tracking interval in milliseconds (15 seconds)
  TRACKING_INTERVAL: parseInt(process.env.NEXT_PUBLIC_GPS_INTERVAL || '15000', 10),

  // Geofence radius in meters (200m)
  GEOFENCE_RADIUS: parseInt(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS || '200', 10),

  // High accuracy GPS
  HIGH_ACCURACY: true,

  // GPS timeout (10 seconds)
  TIMEOUT: 10000,

  // Maximum age of cached position (5 seconds)
  MAXIMUM_AGE: 5000,
} as const;

// Offline Storage Configuration
export const OFFLINE_CONFIG = {
  // Maximum storage limit in bytes (50MB)
  STORAGE_LIMIT: parseInt(process.env.NEXT_PUBLIC_OFFLINE_STORAGE_LIMIT || '52428800', 10),

  // Sync retry interval in milliseconds (30 seconds)
  SYNC_RETRY_INTERVAL: 30000,

  // Maximum number of retry attempts
  MAX_RETRY_ATTEMPTS: 5,
} as const;

// TomTom Maps Configuration
export const TOMTOM_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '',
  MAP_STYLE: 'basic_main',
  DEFAULT_ZOOM: 14,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'RT Driver',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
} as const;

// Mission Status
export const MISSION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE_PICKUP: 'EN_ROUTE_PICKUP',
  ARRIVED_PICKUP: 'ARRIVED_PICKUP',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  IN_TRANSIT: 'IN_TRANSIT',
  ARRIVED_DELIVERY: 'ARRIVED_DELIVERY',
  UNLOADING: 'UNLOADING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

// Geofence Event Types
export const GEOFENCE_EVENTS = {
  ARRIVAL_PICKUP: 'ARRIVAL_PICKUP',
  DEPARTURE_PICKUP: 'DEPARTURE_PICKUP',
  ARRIVAL_DELIVERY: 'ARRIVAL_DELIVERY',
  DEPARTURE_DELIVERY: 'DEPARTURE_DELIVERY',
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  CMR: 'CMR',
  DELIVERY_NOTE: 'DELIVERY_NOTE',
  INVOICE: 'INVOICE',
  PHOTO: 'PHOTO',
  SIGNATURE: 'SIGNATURE',
} as const;
