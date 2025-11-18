'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { uploadDocument, getDocuments, DocumentUpload } from '@/services/api';
import { getCurrentCarrier } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Upload, Image, CheckCircle, Loader2 } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const carrier = getCurrentCarrier();

  useEffect(() => {
    if (!carrier) {
      router.push('/login');
      return;
    }
    if (orderId) {
      loadDocuments(orderId);
    }
  }, [carrier, orderId, router]);

  const loadDocuments = async (orderId: string) => {
    setLoading(true);
    try {
      const data = await getDocuments(orderId);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'CMR' | 'PHOTO' | 'POD'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !orderId) return;

    setUploading(true);
    try {
      await uploadDocument({ file, orderId, type });
      alert('Document uploadé avec succès !');
      await loadDocuments(orderId);
    } catch (err) {
      alert('Erreur lors de l\'upload: ' + (err instanceof Error ? err.message : 'Erreur'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos CMR, photos de livraison et preuves de livraison
          </p>
        </div>

        {!orderId && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sélectionnez une mission</h3>
                <p className="text-gray-500 mt-1">
                  Accédez à une mission depuis la liste pour gérer ses documents
                </p>
                <Button className="mt-4" onClick={() => router.push('/missions/accepted')}>
                  Voir les missions acceptées
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {orderId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Mission {orderId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">CMR (Lettre de voiture)</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, 'CMR')}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Photos de livraison</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'PHOTO')}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preuve de livraison (POD)</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, 'POD')}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                    />
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
                    <span className="text-sm text-gray-600">Upload en cours...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents uploadés</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                )}

                {!loading && documents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun document uploadé pour cette mission
                  </div>
                )}

                {!loading && documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {doc.type === 'PHOTO' ? (
                            <Image className="w-5 h-5 text-gray-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{doc.name || 'Document'}</div>
                            <div className="text-xs text-gray-500">
                              {doc.uploadedAt
                                ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR')
                                : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {doc.type}
                          </Badge>
                          {doc.url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                Voir
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
