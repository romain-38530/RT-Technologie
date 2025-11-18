import { apiClient } from './client';

export interface GPSPosition {
  orderId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface GeofenceEvent {
  type: 'ARRIVAL_PICKUP' | 'DEPARTURE_PICKUP' | 'ARRIVAL_DELIVERY' | 'DEPARTURE_DELIVERY';
  detectedAt: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address?: string;
  };
  automatic: boolean;
}

export interface ETA {
  arrivalTime: string;
  durationMinutes: number;
  distanceKm: number;
  trafficDelay: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PositionResponse {
  success: boolean;
  positionId: string;
  geofenceEvent?: GeofenceEvent;
  eta?: ETA;
}

export interface PositionHistory {
  orderId: string;
  positions: Array<{
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }>;
  totalCount: number;
}

export interface ETAResponse {
  orderId: string;
  destination: {
    latitude: number;
    longitude: number;
    name: string;
  };
  eta: ETA;
}

export interface GeofenceEventsResponse {
  orderId: string;
  events: GeofenceEvent[];
}

/**
 * API client for geo-tracking service (port 3016)
 * Provides GPS tracking, geofencing and ETA calculation with TomTom Traffic API
 */
export const trackingApi = {
  /**
   * Send GPS position to geo-tracking service
   * Automatically detects geofence events and calculates ETA
   */
  sendPosition: async (position: GPSPosition): Promise<PositionResponse> => {
    const response = await apiClient.getClient('GEO_TRACKING').post('/geo-tracking/positions', position);
    return response.data;
  },

  /**
   * Get position history for an order
   */
  getPositionHistory: async (
    orderId: string,
    options?: {
      from?: string;
      to?: string;
      limit?: number;
    }
  ): Promise<PositionHistory> => {
    const params = new URLSearchParams();
    if (options?.from) params.append('from', options.from);
    if (options?.to) params.append('to', options.to);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await apiClient.getClient('GEO_TRACKING').get(
      `/geo-tracking/positions/${orderId}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Calculate ETA to next destination with TomTom Traffic API
   */
  calculateETA: async (
    orderId: string,
    currentLat: number,
    currentLon: number
  ): Promise<ETAResponse> => {
    const response = await apiClient.getClient('GEO_TRACKING').get(
      `/geo-tracking/eta/${orderId}`,
      {
        params: {
          currentLat,
          currentLon,
        },
      }
    );
    return response.data;
  },

  /**
   * Get all geofence events for an order
   */
  getGeofenceEvents: async (orderId: string): Promise<GeofenceEventsResponse> => {
    const response = await apiClient.getClient('GEO_TRACKING').get(
      `/geo-tracking/geofence/events/${orderId}`
    );
    return response.data;
  },

  /**
   * Legacy method for backward compatibility
   * @deprecated Use sendPosition instead
   */
  sendGPSPosition: async (position: GPSPosition): Promise<void> => {
    await trackingApi.sendPosition(position);
  },

  /**
   * Send batch GPS positions (for offline sync)
   */
  sendGPSBatch: async (positions: GPSPosition[]): Promise<void> => {
    // Send positions sequentially to maintain order
    for (const position of positions) {
      try {
        await trackingApi.sendPosition(position);
      } catch (error) {
        console.error('Failed to send position:', error);
        // Continue with next position
      }
    }
  },
};

export default trackingApi;
