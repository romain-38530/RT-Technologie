import { apiClient } from './client';

export interface GPSPosition {
  missionId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface ETAResponse {
  eta: string;
  distance: number;
  duration: number;
  trafficDelay?: number;
}

export const trackingApi = {
  // Send GPS position
  sendGPSPosition: async (position: GPSPosition): Promise<void> => {
    await apiClient.getClient('PLANNING').post('/driver/tracking/gps', position);
  },

  // Send batch GPS positions (for offline sync)
  sendGPSBatch: async (positions: GPSPosition[]): Promise<void> => {
    await apiClient.getClient('PLANNING').post('/driver/tracking/gps/batch', {
      positions,
    });
  },

  // Calculate ETA to destination
  calculateETA: async (
    missionId: string,
    currentPosition: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<ETAResponse> => {
    const response = await apiClient.getClient('PLANNING').post(`/driver/eta/${missionId}`, {
      currentPosition,
      destination,
    });
    return response.data;
  },

  // Check geofence status
  checkGeofence: async (
    missionId: string,
    position: { latitude: number; longitude: number }
  ): Promise<{
    inLoadingZone: boolean;
    inDeliveryZone: boolean;
    nearestZone?: 'loading' | 'delivery';
    distance?: number;
  }> => {
    const response = await apiClient.getClient('PLANNING').post(`/driver/geofence/${missionId}`, {
      position,
    });
    return response.data;
  },
};

export default trackingApi;
