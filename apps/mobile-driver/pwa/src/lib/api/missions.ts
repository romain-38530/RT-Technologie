import { apiClient } from './client';
import { Mission, MissionStatus } from '@/shared/models/Mission';

export const missionsApi = {
  // Get mission by code (for QR scan or manual entry)
  getMissionByCode: async (code: string): Promise<Mission> => {
    const response = await apiClient.getClient('CORE_ORDERS').get(`/driver/missions/code/${code}`);
    return response.data;
  },

  // Get mission by ID
  getMission: async (missionId: string): Promise<Mission> => {
    const response = await apiClient.getClient('CORE_ORDERS').get(`/driver/missions/${missionId}`);
    return response.data;
  },

  // Update mission status
  updateMissionStatus: async (
    missionId: string,
    status: MissionStatus,
    metadata?: {
      latitude?: number;
      longitude?: number;
      timestamp?: string;
      remarks?: string;
    }
  ): Promise<void> => {
    await apiClient.getClient('CORE_ORDERS').post(`/driver/missions/${missionId}/status`, {
      status,
      ...metadata,
    });
  },

  // Start mission
  startMission: async (
    code: string,
    driverInfo: {
      name: string;
      phone: string;
      vehicleRegistration: string;
      trailerRegistration?: string;
    }
  ): Promise<Mission> => {
    const response = await apiClient.getClient('CORE_ORDERS').post(`/driver/missions/start`, {
      code,
      driverInfo,
    });
    return response.data;
  },

  // Get driver's missions history
  getMissionsHistory: async (driverId: string): Promise<Mission[]> => {
    const response = await apiClient.getClient('CORE_ORDERS').get(`/driver/missions/history/${driverId}`);
    return response.data;
  },

  // Get current active mission
  getCurrentMission: async (): Promise<Mission | null> => {
    const response = await apiClient.getClient('CORE_ORDERS').get('/driver/missions/current');
    return response.data;
  },

  // Add remarks/reserves
  addRemarks: async (
    missionId: string,
    remarks: string,
    photos?: string[]
  ): Promise<void> => {
    await apiClient.getClient('CORE_ORDERS').post(`/driver/missions/${missionId}/remarks`, {
      remarks,
      photos,
      timestamp: new Date().toISOString(),
    });
  },
};

export default missionsApi;
