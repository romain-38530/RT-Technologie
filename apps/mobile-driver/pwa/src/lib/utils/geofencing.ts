import { GPS_CONFIG } from '@/shared/constants';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in meters
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if a position is within a geofence
 */
export const isInsideGeofence = (
  position: Coordinates,
  center: Coordinates,
  radius: number = GPS_CONFIG.GEOFENCE_RADIUS
): boolean => {
  const distance = calculateDistance(position, center);
  return distance <= radius;
};

/**
 * Check geofence status for loading and delivery points
 */
export const checkGeofenceStatus = (
  currentPosition: Coordinates,
  loadingPoint: Coordinates,
  deliveryPoint: Coordinates,
  radius: number = GPS_CONFIG.GEOFENCE_RADIUS
): {
  inLoadingZone: boolean;
  inDeliveryZone: boolean;
  distanceToLoading: number;
  distanceToDelivery: number;
  nearestZone: 'loading' | 'delivery' | null;
} => {
  const distanceToLoading = calculateDistance(currentPosition, loadingPoint);
  const distanceToDelivery = calculateDistance(currentPosition, deliveryPoint);

  const inLoadingZone = distanceToLoading <= radius;
  const inDeliveryZone = distanceToDelivery <= radius;

  let nearestZone: 'loading' | 'delivery' | null = null;
  if (distanceToLoading < distanceToDelivery) {
    nearestZone = 'loading';
  } else if (distanceToDelivery < distanceToLoading) {
    nearestZone = 'delivery';
  }

  return {
    inLoadingZone,
    inDeliveryZone,
    distanceToLoading,
    distanceToDelivery,
    nearestZone,
  };
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

/**
 * Calculate bearing between two coordinates
 * @returns bearing in degrees (0-360)
 */
export const calculateBearing = (from: Coordinates, to: Coordinates): number => {
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360; // Normalize to 0-360
};

/**
 * Convert bearing to cardinal direction
 */
export const bearingToDirection = (bearing: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};
