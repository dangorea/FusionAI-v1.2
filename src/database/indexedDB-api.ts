import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import CryptoJS from 'crypto-js';

interface DBConfig {
  dbName: string;
  storeName: string;
  dbVersion?: number;
  keyPath?: string;
  autoIncrement?: boolean;
}

interface EncryptedItem {
  value: string;

  [key: string]: unknown;
}

export class IndexedDBService<T extends Record<string, unknown>> {
  protected readonly dbName: string;

  protected readonly storeName: string;

  protected readonly dbVersion: number;

  protected readonly keyPath: string;

  protected readonly autoIncrement: boolean;

  protected encryptionKey: string | null = null;

  protected dbPromise: Promise<IDBPDatabase> | null = null;

  constructor(config: DBConfig) {
    this.dbName = config.dbName;
    this.storeName = config.storeName;
    this.dbVersion = config.dbVersion || 1;
    this.keyPath = config.keyPath || 'id';
    this.autoIncrement =
      config.autoIncrement !== undefined ? config.autoIncrement : true;

    if (typeof window !== 'undefined') {
      this.encryptionKey = this.getOrCreateEncryptionKey();
      this.dbPromise = this.initDB();
    }
  }

  async save(item: T): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    const key = item[this.keyPath as keyof T];
    const encryptedItem = await this.encrypt(item);
    const itemToStore: EncryptedItem = {
      [this.keyPath]: key,
      value: encryptedItem,
    } as EncryptedItem;
    await store.put(itemToStore);
    await tx.done;
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    const encryptedItems: EncryptedItem[] = await store.getAll();
    await tx.done;
    return Promise.all(encryptedItems.map(this.decryptItem.bind(this)));
  }

  async getByKey(key: IDBValidKey): Promise<T | undefined> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    let encryptedItem: EncryptedItem | undefined;
    if (store.indexNames.contains(`${this.keyPath}_index`)) {
      encryptedItem = await store.index(`${this.keyPath}_index`).get(key);
    } else {
      encryptedItem = await store.get(key);
    }
    await tx.done;
    return encryptedItem ? this.decryptItem(encryptedItem) : undefined;
  }

  async deleteByKey(key: IDBValidKey): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await store.delete(key);
    await tx.done;
  }

  async clearStore(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await store.clear();
    await tx.done;
  }

  protected getOrCreateEncryptionKey(): string {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available on the server side.');
    }
    let key = localStorage.getItem('encryptionKey');
    if (!key) {
      console.log(
        'Encryption key missing. Clearing IndexedDB to prevent corruption.',
      );
      this.clearStore();
      key = CryptoJS.lib.WordArray.random(32).toString();
      localStorage.setItem('encryptionKey', key);
    }
    return key;
  }

  protected async initDB(): Promise<IDBPDatabase> {
    return openDB(this.dbName, this.dbVersion, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: this.keyPath,
            autoIncrement: this.autoIncrement,
          });
          store.createIndex(`${this.keyPath}_index`, this.keyPath, {
            unique: true,
          });
        }
      },
    });
  }

  protected async getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      console.log(
        'IndexedDB is not available in the current environment. Returning a dummy DB object.',
      );
      return {
        transaction: () => ({
          objectStore: () => ({
            put: async () => {},
            get: async () => undefined,
            getAll: async () => [],
            delete: async () => {},
            clear: async () => {},
          }),
          done: Promise.resolve(),
        }),
        close: () => {},
      } as unknown as IDBPDatabase;
    }
    return this.dbPromise;
  }

  protected async ensureEncryptionKey(): Promise<void> {
    if (!this.encryptionKey) {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available on the server side.');
      }
      this.encryptionKey = this.getOrCreateEncryptionKey();
    }
  }

  protected async encrypt(data: T): Promise<string> {
    await this.ensureEncryptionKey();
    const { [this.keyPath]: _, ...dataWithoutKey } = data;
    const stringData = JSON.stringify(dataWithoutKey);
    const encryptedData = CryptoJS.AES.encrypt(stringData, this.encryptionKey!);
    return encryptedData.toString();
  }

  protected async decrypt(data: string): Promise<T> {
    await this.ensureEncryptionKey();
    if (!data) {
      console.log('Attempted to decrypt empty data. Returning empty object.');
      return {} as T;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.encryptionKey!);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error('Failed to decrypt data');
      }
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.log('Decryption failed. Clearing store and retrying.', error);
      await this.clearStore();
      return {} as T;
    }
  }

  protected async decryptItem(data: EncryptedItem): Promise<T> {
    const decryptedValue = await this.decrypt(data.value);
    return {
      ...decryptedValue,
      [this.keyPath]: data[this.keyPath],
    } as T;
  }
}
