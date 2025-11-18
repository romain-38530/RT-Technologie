'use client';

import React, { useRef, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/shared/constants';

interface DocumentScannerProps {
  onCapture: (file: File) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onCapture,
  onError,
  acceptedTypes = ACCEPTED_IMAGE_TYPES,
  maxSize = MAX_FILE_SIZE,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      onError?.(`Type de fichier non accepté. Formats acceptés: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      onError?.(`Fichier trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call callback
    onCapture(file);
  };

  const handleCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="w-full">
          <div className="relative rounded-lg overflow-hidden border-2 border-rt-blue mb-4">
            <img src={preview} alt="Preview" className="w-full h-auto" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 h-touch bg-rt-gray text-white rounded-lg text-driver font-semibold active:bg-opacity-80"
              type="button"
            >
              Supprimer
            </button>
            <button
              onClick={handleCamera}
              className="flex-1 h-touch bg-rt-blue text-white rounded-lg text-driver font-semibold active:bg-opacity-80"
              type="button"
            >
              Reprendre
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <button
            onClick={handleCamera}
            className="w-full h-32 border-2 border-dashed border-rt-blue rounded-lg bg-blue-50 text-rt-blue font-semibold text-driver flex flex-col items-center justify-center active:bg-blue-100"
            type="button"
          >
            <svg
              className="w-12 h-12 mb-2"
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
            Prendre une photo
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentScanner;
