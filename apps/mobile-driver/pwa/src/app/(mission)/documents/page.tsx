'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mission, Document } from '@/shared/models/Mission';
import { documentsApi } from '@/lib/api/documents';
import { storage } from '@/lib/utils/storage';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import DocumentScanner from '@/components/DocumentScanner';
import { DOCUMENT_TYPES } from '@/shared/constants';

export default function DocumentsPage() {
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { position, getCurrentPosition } = useGeolocation();

  useEffect(() => {
    const storedMission = storage.getCurrentMission();
    if (storedMission) {
      setMission(storedMission);
      loadDocuments(storedMission.id);
      getCurrentPosition();
    } else {
      router.push('/mission/dashboard');
    }
  }, [router, getCurrentPosition]);

  const loadDocuments = async (missionId: string) => {
    try {
      const docs = await documentsApi.getMissionDocuments(missionId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileCapture = async (file: File) => {
    if (!mission || !position || !selectedType) return;

    setIsUploading(true);
    try {
      const metadata = {
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: new Date().toISOString(),
      };

      await documentsApi.uploadDocument(mission.id, file, selectedType, metadata);

      alert('Document enregistré avec succès');
      setShowScanner(false);
      setSelectedType('');
      loadDocuments(mission.id);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erreur lors de l\'upload du document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDocument = (type: string) => {
    setSelectedType(type);
    setShowScanner(true);
  };

  if (!mission) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rt-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-driver text-rt-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showScanner) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
          <button onClick={() => setShowScanner(false)} className="mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-driver-xl font-bold">
            {DOCUMENT_TYPES[selectedType as keyof typeof DOCUMENT_TYPES] || 'Document'}
          </h1>
        </div>

        <div className="flex-1 p-6">
          {isUploading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-rt-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-driver text-rt-gray">Envoi en cours...</p>
              </div>
            </div>
          ) : (
            <DocumentScanner onCapture={handleFileCapture} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
        <button onClick={() => router.back()} className="mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-driver-xl font-bold">Documents</h1>
        <p className="text-white opacity-90 mt-1">Mission {mission.code}</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto safe-bottom">
        {/* Add Document Buttons */}
        <div className="mb-6">
          <h2 className="text-driver-lg font-bold text-rt-dark mb-3">
            Ajouter un document
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAddDocument('BL')}
              className="h-24 bg-white border-2 border-rt-blue rounded-lg text-rt-blue font-semibold active:bg-blue-50"
            >
              <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Bon de livraison
            </button>

            <button
              onClick={() => handleAddDocument('CMR')}
              className="h-24 bg-white border-2 border-rt-blue rounded-lg text-rt-blue font-semibold active:bg-blue-50"
            >
              <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CMR
            </button>

            <button
              onClick={() => handleAddDocument('CUSTOMS')}
              className="h-24 bg-white border-2 border-rt-blue rounded-lg text-rt-blue font-semibold active:bg-blue-50"
            >
              <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Douane
            </button>

            <button
              onClick={() => handleAddDocument('PHOTO')}
              className="h-24 bg-white border-2 border-rt-blue rounded-lg text-rt-blue font-semibold active:bg-blue-50"
            >
              <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Photo
            </button>
          </div>
        </div>

        {/* Document List */}
        <div>
          <h2 className="text-driver-lg font-bold text-rt-dark mb-3">
            Documents enregistrés ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <svg className="w-16 h-16 text-rt-gray mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-driver text-rt-gray">Aucun document pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 bg-rt-blue rounded-lg flex items-center justify-center text-white mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-rt-dark">
                        {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES] || doc.type}
                      </p>
                      <p className="text-sm text-rt-gray">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleString('fr-FR')
                          : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-rt-green rounded-full flex items-center justify-center text-white active:bg-opacity-80"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
