'use client';

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel?: () => void;
  title?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  title = 'Signature',
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigCanvas.current && !isEmpty) {
      const signature = sigCanvas.current.toDataURL('image/png');
      onSave(signature);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-driver-lg font-bold text-rt-dark mb-4">{title}</h2>

      <div className="flex-1 border-2 border-rt-gray rounded-lg overflow-hidden mb-4">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-full',
            style: { touchAction: 'none' },
          }}
          backgroundColor="white"
          onBegin={handleBegin}
        />
      </div>

      <div className="text-sm text-rt-gray mb-4 text-center">
        Signez dans la zone ci-dessus
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 h-touch bg-rt-gray text-white rounded-lg text-driver font-semibold active:bg-opacity-80"
          type="button"
        >
          Effacer
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 h-touch bg-white border-2 border-rt-gray text-rt-gray rounded-lg text-driver font-semibold active:bg-gray-100"
            type="button"
          >
            Annuler
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="flex-1 h-touch bg-rt-green text-white rounded-lg text-driver font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-opacity-80"
          type="button"
        >
          Valider
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
