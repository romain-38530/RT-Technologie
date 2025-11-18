'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GPS_CONFIG } from '@/shared/constants';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  trackingInterval?: number;
  onPositionUpdate?: (position: Position) => void;
  onError?: (error: GeolocationPositionError) => void;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    enableHighAccuracy = GPS_CONFIG.HIGH_ACCURACY,
    timeout = GPS_CONFIG.TIMEOUT,
    maximumAge = GPS_CONFIG.MAXIMUM_AGE,
    trackingInterval = GPS_CONFIG.TRACKING_INTERVAL,
    onPositionUpdate,
    onError,
  } = options;

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    return new Promise<Position>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition: Position = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            speed: pos.coords.speed ?? undefined,
            heading: pos.coords.heading ?? undefined,
          };
          setPosition(newPosition);
          setError(null);
          resolve(newPosition);
        },
        (err) => {
          const errorMsg = `Geolocation error: ${err.message}`;
          setError(errorMsg);
          onError?.(err);
          reject(err);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge, onError]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);

    // Use setInterval for consistent tracking
    intervalRef.current = setInterval(async () => {
      try {
        const pos = await getCurrentPosition();
        onPositionUpdate?.(pos);
      } catch (err) {
        console.error('Tracking error:', err);
      }
    }, trackingInterval);
  }, [getCurrentPosition, trackingInterval, onPositionUpdate]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    position,
    error,
    isTracking,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
};

export default useGeolocation;
