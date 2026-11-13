import { ActivityAttempt, ChildProfile, DrawingRecord } from '../types/game';

const DB_NAME = 'lulu_nono_knowledge_db';
const DB_VERSION = 1;

export const STORE_PROFILES = 'profiles';
export const STORE_ACTIVITY_LOGS = 'activity_logs';
export const STORE_DRAWINGS = 'drawings';
export const STORE_ASSET_CACHE = 'asset_cache';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB غير مدعوم في هذه البيئة'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROFILES)) {
        db.createObjectStore(STORE_PROFILES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ACTIVITY_LOGS)) {
        const logStore = db.createObjectStore(STORE_ACTIVITY_LOGS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        logStore.createIndex('by_profile', 'profileId', { unique: false });
        logStore.createIndex('by_world', 'worldId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_DRAWINGS)) {
        const drawStore = db.createObjectStore(STORE_DRAWINGS, { keyPath: 'id' });
        drawStore.createIndex('by_profile', 'profileId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_ASSET_CACHE)) {
        db.createObjectStore(STORE_ASSET_CACHE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('تعذر فتح قاعدة البيانات المحلية'));
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  executor: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = executor(store);
    let resultValue: T;
    let settled = false;

    req.onsuccess = () => {
      resultValue = req.result;
      if (mode === 'readonly' && !settled) {
        settled = true;
        resolve(resultValue);
      }
    };
    req.onerror = () => {
      if (!settled) {
        settled = true;
        reject(req.error ?? new Error(`IndexedDB error in ${storeName}`));
      }
    };
    tx.oncomplete = () => {
      db.close();
      if (!settled) {
        settled = true;
        resolve(resultValue);
      }
    };
    tx.onerror = () => {
      db.close();
      if (!settled) {
        settled = true;
        reject(tx.error ?? new Error(`IndexedDB transaction error in ${storeName}`));
      }
    };
    tx.onabort = () => {
      db.close();
      if (!settled) {
        settled = true;
        reject(tx.error ?? new Error(`IndexedDB transaction aborted in ${storeName}`));
      }
    };
  });
}

export const indexedDbService = {
  async saveProfile(profile: ChildProfile): Promise<void> {
    await withStore(STORE_PROFILES, 'readwrite', (store) => store.put(profile));
  },

  async getAllProfiles(): Promise<ChildProfile[]> {
    return withStore<ChildProfile[]>(STORE_PROFILES, 'readonly', (store) => store.getAll());
  },

  async deleteProfile(profileId: string): Promise<void> {
    await withStore(STORE_PROFILES, 'readwrite', (store) => store.delete(profileId));
  },

  async logActivity(attempt: ActivityAttempt): Promise<number> {
    return withStore<IDBValidKey>(STORE_ACTIVITY_LOGS, 'readwrite', (store) =>
      store.add(attempt)
    ) as Promise<number>;
  },

  async getActivityLogsByProfile(profileId: string): Promise<ActivityAttempt[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ACTIVITY_LOGS, 'readonly');
      const index = tx.objectStore(STORE_ACTIVITY_LOGS).index('by_profile');
      const req = index.getAll(profileId);
      req.onsuccess = () => resolve((req.result as ActivityAttempt[]) ?? []);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  },

  async saveDrawing(drawing: DrawingRecord): Promise<void> {
    await withStore(STORE_DRAWINGS, 'readwrite', (store) => store.put(drawing));
  },

  async getDrawingsByProfile(profileId: string): Promise<DrawingRecord[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DRAWINGS, 'readonly');
      const index = tx.objectStore(STORE_DRAWINGS).index('by_profile');
      const req = index.getAll(profileId);
      req.onsuccess = () => resolve((req.result as DrawingRecord[]) ?? []);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  },

  async clearAllData(): Promise<void> {
    const db = await openDatabase();
    const storeNames = [STORE_PROFILES, STORE_ACTIVITY_LOGS, STORE_DRAWINGS, STORE_ASSET_CACHE];
    await Promise.all(
      storeNames.map(
        (name) =>
          new Promise<void>((resolve, reject) => {
            const tx = db.transaction(name, 'readwrite');
            const req = tx.objectStore(name).clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          })
      )
    );
    db.close();
  },

  /**
   * Executes a real write -> read -> delete verification against IndexedDB (both asset_cache and profiles).
   */
  async runSelfTest(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    const started = performance.now();
    try {
      const testKey = '__phase0_probe__';
      const payload = { key: testKey, checkedAt: Date.now() };
      await withStore(STORE_ASSET_CACHE, 'readwrite', (s) => s.put(payload));
      const readBack = await withStore<{ key: string; checkedAt: number } | undefined>(
        STORE_ASSET_CACHE,
        'readonly',
        (s) => s.get(testKey)
      );
      await withStore(STORE_ASSET_CACHE, 'readwrite', (s) => s.delete(testKey));

      const probeProfileId = '__phase0_profile_probe__';
      await withStore(STORE_PROFILES, 'readwrite', (s) =>
        s.put({ id: probeProfileId, name: 'probe', checkedAt: payload.checkedAt })
      );
      const profileBack = await withStore<{ id: string; checkedAt: number } | undefined>(
        STORE_PROFILES,
        'readonly',
        (s) => s.get(probeProfileId)
      );
      await withStore(STORE_PROFILES, 'readwrite', (s) => s.delete(probeProfileId));

      const ok = Boolean(
        readBack &&
          readBack.checkedAt === payload.checkedAt &&
          profileBack &&
          profileBack.checkedAt === payload.checkedAt
      );
      return {
        ok,
        latencyMs: Math.round(performance.now() - started),
        message: ok
          ? 'نجحت دورة الكتابة والقراءة والحذف في asset_cache و profiles'
          : 'عدم تطابق البيانات المقروءة',
      };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Math.round(performance.now() - started),
        message: err instanceof Error ? err.message : 'خطأ غير متوقع في IndexedDB',
      };
    }
  },
};
