'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 300,
  title = 'Code QR',
  subtitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-driver-lg font-bold text-rt-dark mb-2">{title}</h2>
      {subtitle && (
        <p className="text-driver text-rt-gray mb-4 text-center">{subtitle}</p>
      )}

      <div className="bg-white p-4 rounded-lg border-2 border-rt-blue">
        <canvas ref={canvasRef} />
      </div>

      <p className="text-sm text-rt-gray mt-4 text-center">
        Présentez ce QR code au destinataire pour qu'il signe
      </p>
    </div>
  );
};

export default QRCodeDisplay;
