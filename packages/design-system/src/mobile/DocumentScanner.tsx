import * as React from 'react';
import { cn } from '../lib/utils';

export interface ScannedDocument {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: Date;
}

export interface DocumentScannerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onScan?: (document: ScannedDocument) => void;
  onRemove?: (documentId: string) => void;
  documents?: ScannedDocument[];
  maxDocuments?: number;
  acceptedTypes?: string[];
}

const DocumentScanner = React.forwardRef<HTMLDivElement, DocumentScannerProps>(
  (
    {
      className,
      onScan,
      onRemove,
      documents = [],
      maxDocuments = 10,
      acceptedTypes = ['image/*', 'application/pdf'],
      ...props
    },
    ref
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isCameraActive, setIsCameraActive] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        if (documents.length >= maxDocuments) {
          alert(`Maximum ${maxDocuments} documents autorisés`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const newDocument: ScannedDocument = {
            id: `doc-${Date.now()}-${Math.random()}`,
            name: file.name,
            dataUrl,
            timestamp: new Date(),
          };
          onScan?.(newDocument);
        };
        reader.readAsDataURL(file);
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Caméra arrière sur mobile
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error('Erreur lors de l\'accès à la caméra:', error);
        alert('Impossible d\'accéder à la caméra. Veuillez utiliser l\'upload de fichier.');
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };

    const capturePhoto = () => {
      if (!videoRef.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const newDocument: ScannedDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: `Photo-${new Date().toLocaleString()}.jpg`,
        dataUrl,
        timestamp: new Date(),
      };

      onScan?.(newDocument);
      stopCamera();
    };

    React.useEffect(() => {
      // Cleanup au démontage
      return () => {
        stopCamera();
      };
    }, []);

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Caméra */}
        {isCameraActive ? (
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />

            {/* Overlay de guidage */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-white border-dashed w-4/5 aspect-[3/4] rounded-lg opacity-50" />
            </div>

            {/* Instructions */}
            <div className="absolute top-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full inline-block">
                Positionnez le document dans le cadre
              </p>
            </div>

            {/* Boutons */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="min-h-[48px] px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 active:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={capturePhoto}
                className="min-h-[56px] min-w-[56px] rounded-full bg-white border-4 border-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
              >
                <span className="sr-only">Capturer</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                disabled={documents.length >= maxDocuments}
                className="min-h-[56px] py-4 px-6 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 flex flex-col items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Prendre photo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={documents.length >= maxDocuments}
                className="min-h-[56px] py-4 px-6 rounded-lg border-2 border-blue-600 bg-white text-blue-600 font-semibold text-base hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 flex flex-col items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Choisir fichier</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </>
        )}

        {/* Liste des documents scannés */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Documents ({documents.length}/{maxDocuments})
              </h4>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                >
                  {/* Aperçu */}
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {doc.dataUrl.startsWith('data:image') ? (
                      <img
                        src={doc.dataUrl}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.timestamp.toLocaleString()}
                    </p>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => onRemove?.(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

DocumentScanner.displayName = 'DocumentScanner';

export { DocumentScanner };
