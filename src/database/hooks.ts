import { useCallback, useEffect, useState } from 'react';
import { DB_NAME, DB_STORES_SCHEMAS, DB_VERSION } from './consts';
import { DBStores } from './types';

function getDatabase(): Promise<IDBDatabase> {
  const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

  openRequest.onupgradeneeded = () => {
    const database = openRequest.result;

    DB_STORES_SCHEMAS.forEach((storeInfo) => {
      if (!database.objectStoreNames.contains(storeInfo.name)) {
        database.createObjectStore(storeInfo.name, {
          keyPath: storeInfo.key,
          autoIncrement: true,
        });
      }
    });
  };

  return new Promise((resolve, reject) => {
    openRequest.onsuccess = () => {
      resolve(openRequest.result);
    };

    openRequest.onerror = () => {
      reject(new Error('Failed to open the database'));
    };
  });
}

// TODO: Create useCollection hook for typed access to a particular Object Store
export const useIndexedDB = () => {
  const [asyncDbRef] = useState<Promise<IDBDatabase>>(getDatabase());

  useEffect(() => {
    return () => {
      asyncDbRef.then((db) => db.close());
    };
  }, []);

  const transactionWithStore = useCallback(
    async <T>(
      storeName: string,
      block: (store: IDBObjectStore) => IDBRequest<T>,
    ): Promise<T> => {
      const db = await asyncDbRef;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = block(store);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    [asyncDbRef],
  );

  const addItem = useCallback(
    async <T>(storeName: DBStores, item: T): Promise<void> => {
      await transactionWithStore(storeName, (store) => store.add(item));
    },
    [transactionWithStore],
  );

  const getItem = useCallback(
    <T>(storeName: DBStores, id: number): Promise<T | null> => {
      return transactionWithStore(storeName, (store) => store.get(id) ?? null);
    },
    [transactionWithStore],
  );

  const getItems = useCallback(
    <T>(storeName: DBStores): Promise<T[]> => {
      return transactionWithStore(storeName, (store) => store.getAll() ?? null);
    },
    [transactionWithStore],
  );

  const updateItem = useCallback(
    async <T>(storeName: DBStores, item: T): Promise<void> => {
      await transactionWithStore(storeName, (store) => store.put(item));
    },
    [transactionWithStore],
  );

  const deleteItem = useCallback(
    async (storeName: DBStores, id: number): Promise<void> => {
      await transactionWithStore(storeName, (store) => store.delete(id));
    },
    [transactionWithStore],
  );

  return {
    addItem,
    getItem,
    getItems,
    updateItem,
    deleteItem,
  };
};
