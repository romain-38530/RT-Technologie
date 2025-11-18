import { STORAGE_KEYS } from '@/shared/constants';

/**
 * Type-safe localStorage wrapper
 */
export const storage = {
  // Generic get/set
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Specific helpers
  getToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string): void => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  clearToken: (): void => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  getCurrentMission: () => {
    return storage.get(STORAGE_KEYS.CURRENT_MISSION);
  },

  setCurrentMission: (mission: any): void => {
    storage.set(STORAGE_KEYS.CURRENT_MISSION, mission);
  },

  clearCurrentMission: (): void => {
    storage.remove(STORAGE_KEYS.CURRENT_MISSION);
  },

  getUserProfile: () => {
    return storage.get(STORAGE_KEYS.USER_PROFILE);
  },

  setUserProfile: (profile: any): void => {
    storage.set(STORAGE_KEYS.USER_PROFILE, profile);
  },
};

/**
 * IndexedDB wrapper for larger data (like images)
 */
export class IndexedDBStorage {
  private dbName = 'RTDriverDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      };
    });
  }

  async saveImage(id: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.put({ id, blob, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getImage(id: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDB = new IndexedDBStorage();
