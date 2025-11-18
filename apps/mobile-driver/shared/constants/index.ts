export const GPS_CONFIG = {
  TRACKING_INTERVAL: parseInt(process.env.NEXT_PUBLIC_GPS_INTERVAL || '15000'),
  GEOFENCE_RADIUS: parseInt(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS || '200'),
  HIGH_ACCURACY: true,
  TIMEOUT: 10000,
  MAXIMUM_AGE: 0,
} as const;

export const MISSION_STATUS_LABELS = {
  PENDING: 'En attente',
  EN_ROUTE_TO_LOADING: 'En route vers chargement',
  ARRIVED_LOADING: 'Arrivé au chargement',
  LOADED: 'Chargé',
  EN_ROUTE_TO_DELIVERY: 'En route vers livraison',
  ARRIVED_DELIVERY: 'Arrivé à la livraison',
  DELIVERED: 'Livré',
  CANCELLED: 'Annulé',
} as const;

export const STATUS_COLORS = {
  PENDING: '#6C757D',
  EN_ROUTE_TO_LOADING: '#0066CC',
  ARRIVED_LOADING: '#FF8C00',
  LOADED: '#28A745',
  EN_ROUTE_TO_DELIVERY: '#0066CC',
  ARRIVED_DELIVERY: '#FF8C00',
  DELIVERED: '#28A745',
  CANCELLED: '#DC3545',
} as const;

export const API_ENDPOINTS = {
  CORE_ORDERS: process.env.NEXT_PUBLIC_CORE_ORDERS_API || 'http://localhost:3001',
  PLANNING: process.env.NEXT_PUBLIC_PLANNING_API || 'http://localhost:3004',
  ECMR: process.env.NEXT_PUBLIC_ECMR_API || 'http://localhost:3009',
  NOTIFICATIONS: process.env.NEXT_PUBLIC_NOTIFICATIONS_API || 'http://localhost:3002',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'rt_driver_token',
  CURRENT_MISSION: 'rt_current_mission',
  PENDING_UPDATES: 'rt_pending_updates',
  USER_PROFILE: 'rt_user_profile',
  GPS_POSITIONS: 'rt_gps_positions',
} as const;

export const DOCUMENT_TYPES = {
  CMR: 'CMR',
  BL: 'BL',
  DELIVERY_NOTE: 'Bon de livraison',
  CUSTOMS: 'Document douanier',
  PHOTO: 'Photo',
  SIGNATURE_LOADING: 'Signature chargement',
  SIGNATURE_DELIVERY: 'Signature livraison',
  DAMAGE_REPORT: 'Constat de dommage',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_DOCUMENT_TYPES = [...ACCEPTED_IMAGE_TYPES, 'application/pdf'];

export const NOTIFICATION_MESSAGES = {
  MISSION_STARTED: 'Mission démarrée avec succès',
  STATUS_UPDATED: 'Statut mis à jour',
  SIGNATURE_SAVED: 'Signature enregistrée',
  DOCUMENT_UPLOADED: 'Document téléchargé',
  GPS_ERROR: 'Erreur de géolocalisation',
  NETWORK_ERROR: 'Erreur réseau - mode hors ligne activé',
  SYNC_SUCCESS: 'Synchronisation réussie',
} as const;

export const GEOFENCE_EVENTS = {
  ENTER_LOADING: 'ENTER_LOADING',
  EXIT_LOADING: 'EXIT_LOADING',
  ENTER_DELIVERY: 'ENTER_DELIVERY',
  EXIT_DELIVERY: 'EXIT_DELIVERY',
  DEVIATION: 'DEVIATION',
} as const;
