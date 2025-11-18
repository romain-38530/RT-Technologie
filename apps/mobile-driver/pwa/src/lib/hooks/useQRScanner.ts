'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async (elementId: string) => {
    try {
      setError(null);
      setScannedCode(null);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      scannerRef.current = new Html5Qrcode(elementId);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScannedCode(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // This error fires continuously while scanning, so we don't set it
          // console.log('Scan error:', errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start QR scanner');
      console.error('QR Scanner error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return {
    isScanning,
    scannedCode,
    error,
    startScanning,
    stopScanning,
  };
};

export default useQRScanner;
