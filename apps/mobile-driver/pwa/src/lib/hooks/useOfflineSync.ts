'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/shared/constants';

export interface PendingUpdate {
  id: string;
  type: 'GPS' | 'STATUS' | 'SIGNATURE' | 'DOCUMENT';
  data: any;
  timestamp: string;
  retryCount: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending updates from localStorage
  const loadPendingUpdates = useCallback(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_UPDATES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading pending updates:', error);
      return [];
    }
  }, []);

  // Save pending updates to localStorage
  const savePendingUpdates = useCallback((updates: PendingUpdate[]) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_UPDATES, JSON.stringify(updates));
      setPendingUpdates(updates);
    } catch (error) {
      console.error('Error saving pending updates:', error);
    }
  }, []);

  // Add update to queue
  const addPendingUpdate = useCallback(
    (type: PendingUpdate['type'], data: any) => {
      const update: PendingUpdate = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      const updates = [...loadPendingUpdates(), update];
      savePendingUpdates(updates);
    },
    [loadPendingUpdates, savePendingUpdates]
  );

  // Remove update from queue
  const removePendingUpdate = useCallback(
    (id: string) => {
      const updates = loadPendingUpdates().filter((u: PendingUpdate) => u.id !== id);
      savePendingUpdates(updates);
    },
    [loadPendingUpdates, savePendingUpdates]
  );

  // Sync all pending updates
  const syncPendingUpdates = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const updates = loadPendingUpdates();
    if (updates.length === 0) return;

    setIsSyncing(true);

    for (const update of updates) {
      try {
        // Process update based on type
        // This would call the appropriate API
        console.log('Syncing update:', update);

        // On success, remove from queue
        removePendingUpdate(update.id);
      } catch (error) {
        console.error('Error syncing update:', error);

        // Increment retry count
        const updatedUpdate = {
          ...update,
          retryCount: update.retryCount + 1,
        };

        // If max retries reached, remove from queue
        if (updatedUpdate.retryCount >= 3) {
          removePendingUpdate(update.id);
        } else {
          // Update retry count
          const allUpdates = loadPendingUpdates().map((u: PendingUpdate) =>
            u.id === update.id ? updatedUpdate : u
          );
          savePendingUpdates(allUpdates);
        }
      }
    }

    setIsSyncing(false);
  }, [isOnline, isSyncing, loadPendingUpdates, removePendingUpdate, savePendingUpdates]);

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingUpdates();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending updates on mount
    setPendingUpdates(loadPendingUpdates());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingUpdates, syncPendingUpdates]);

  return {
    isOnline,
    pendingUpdates,
    isSyncing,
    addPendingUpdate,
    removePendingUpdate,
    syncPendingUpdates,
  };
};

export default useOfflineSync;
