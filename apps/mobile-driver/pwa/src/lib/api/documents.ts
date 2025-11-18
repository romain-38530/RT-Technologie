import { apiClient } from './client';
import { Signature, Document } from '@/shared/models/Mission';

export const documentsApi = {
  // Upload document (photo, scan, etc.)
  uploadDocument: async (
    missionId: string,
    file: File,
    type: string,
    metadata?: {
      latitude?: number;
      longitude?: number;
      timestamp?: string;
    }
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiClient.getClient('ECMR').post(
      `/driver/missions/${missionId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Save signature (loading point)
  saveLoadingSignature: async (
    missionId: string,
    signatureData: string,
    signerName: string,
    metadata: {
      latitude: number;
      longitude: number;
      timestamp: string;
      remarks?: string;
    }
  ): Promise<Signature> => {
    const response = await apiClient.getClient('ECMR').post('/ecmr/signature/logistics', {
      missionId,
      signatureData,
      signerName,
      type: 'LOADING',
      ...metadata,
    });
    return response.data;
  },

  // Save signature (delivery point)
  saveDeliverySignature: async (
    missionId: string,
    signatureData: string,
    signerName: string,
    metadata: {
      latitude: number;
      longitude: number;
      timestamp: string;
      remarks?: string;
      photos?: string[];
    }
  ): Promise<Signature> => {
    const response = await apiClient.getClient('ECMR').post('/ecmr/signature/recipient', {
      missionId,
      signatureData,
      signerName,
      type: 'DELIVERY',
      ...metadata,
    });
    return response.data;
  },

  // Generate CMR PDF
  generateCMR: async (missionId: string): Promise<{ url: string }> => {
    const response = await apiClient.getClient('ECMR').post(`/ecmr/generate/${missionId}`);
    return response.data;
  },

  // Get mission documents
  getMissionDocuments: async (missionId: string): Promise<Document[]> => {
    const response = await apiClient.getClient('ECMR').get(`/driver/missions/${missionId}/documents`);
    return response.data;
  },

  // Get QR code for recipient signature
  getRecipientQRCode: async (missionId: string): Promise<{ qrCode: string; url: string }> => {
    const response = await apiClient.getClient('ECMR').get(`/ecmr/recipient-qr/${missionId}`);
    return response.data;
  },
};

export default documentsApi;
