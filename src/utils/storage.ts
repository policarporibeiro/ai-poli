import { WorkshopPlan } from '../types/workshop';

const DB_NAME = 'atelie_maker_db';
const DB_VERSION = 1;
const STORE_NAME = 'workshop_plans';
const LEGACY_STORAGE_KEY = 'atelie_maker_saved_plans_v1';

/**
 * Checks if IndexedDB is available in the current environment
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Opens and initializes the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error('IndexedDB não está disponível neste navegador.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('titulo_oficina', 'titulo_oficina', { unique: false });
        store.createIndex('theme', 'theme', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao abrir o banco de dados IndexedDB.'));
    };
  });
}

/**
 * Migrates legacy localStorage plans to IndexedDB once
 */
let hasMigrated = false;
async function migrateFromLocalStorage(db: IDBDatabase): Promise<void> {
  if (hasMigrated) return;
  hasMigrated = true;

  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;

    const legacyPlans: WorkshopPlan[] = JSON.parse(raw);
    if (!Array.isArray(legacyPlans) || legacyPlans.length === 0) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const plan of legacyPlans) {
      if (plan && plan.id) {
        store.put(plan);
      }
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Migração de localStorage para IndexedDB ignorada:', err);
  }
}

/**
 * Fallback to read from localStorage if IndexedDB is blocked
 */
function getLegacyFallback(): WorkshopPlan[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Fallback to save in localStorage as secondary backup
 */
function saveLegacyFallback(plans: WorkshopPlan[]): void {
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.warn('Aviso ao sincronizar backup no localStorage:', e);
  }
}

/**
 * Retrieves all saved workshop plans from IndexedDB (with fallback)
 */
export async function getSavedPlans(): Promise<WorkshopPlan[]> {
  try {
    const db = await openDatabase();
    await migrateFromLocalStorage(db);

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const plans: WorkshopPlan[] = request.result || [];
        // Sort newest first
        plans.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        // Keep localStorage in sync as backup
        saveLegacyFallback(plans);
        resolve(plans);
      };

      request.onerror = () => {
        console.warn('Erro ao ler planos do IndexedDB, recorrendo ao fallback:', request.error);
        resolve(getLegacyFallback());
      };
    });
  } catch (error) {
    console.warn('IndexedDB inacessível, utilizando localStorage:', error);
    return getLegacyFallback();
  }
}

/**
 * Saves or updates a workshop plan in IndexedDB
 */
export async function savePlanToStorage(plan: WorkshopPlan): Promise<WorkshopPlan[]> {
  const planToSave: WorkshopPlan = {
    ...plan,
    id: plan.id || `plan_${Date.now()}`,
    createdAt: plan.createdAt || new Date().toISOString(),
  };

  try {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(planToSave);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return await getSavedPlans();
  } catch (error) {
    console.warn('Erro ao salvar no IndexedDB, usando fallback:', error);
    const existing = getLegacyFallback();
    const updated = [planToSave, ...existing.filter((p) => p.id !== planToSave.id)];
    saveLegacyFallback(updated);
    return updated;
  }
}

/**
 * Deletes a workshop plan from IndexedDB by ID
 */
export async function deleteSavedPlan(id: string): Promise<WorkshopPlan[]> {
  try {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return await getSavedPlans();
  } catch (error) {
    console.warn('Erro ao excluir no IndexedDB, usando fallback:', error);
    const existing = getLegacyFallback();
    const updated = existing.filter((p) => p.id !== id);
    saveLegacyFallback(updated);
    return updated;
  }
}

/**
 * Retrieves a single plan by ID directly from IndexedDB
 */
export async function getPlanById(id: string): Promise<WorkshopPlan | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        const fallback = getLegacyFallback().find((p) => p.id === id);
        resolve(fallback || null);
      };
    });
  } catch {
    const fallback = getLegacyFallback().find((p) => p.id === id);
    return fallback || null;
  }
}

/**
 * Exports all plans from IndexedDB as a downloadable JSON string
 */
export async function exportAllPlansAsJson(): Promise<string> {
  const plans = await getSavedPlans();
  return JSON.stringify(plans, null, 2);
}

/**
 * Imports plans from a JSON string into IndexedDB
 */
export async function importPlansFromJson(jsonString: string): Promise<WorkshopPlan[]> {
  const parsed = JSON.parse(jsonString);
  const items: WorkshopPlan[] = Array.isArray(parsed) ? parsed : [parsed];

  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const item of items) {
    if (item && item.titulo_oficina) {
      const toStore: WorkshopPlan = {
        ...item,
        id: item.id || `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: item.createdAt || new Date().toISOString(),
      };
      store.put(toStore);
    }
  }

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return await getSavedPlans();
}
