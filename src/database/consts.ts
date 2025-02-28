import { DBStores } from './types';

export const DB_VERSION = 1;

export const DB_NAME = 'fw-ai';

export const DB_STORES_SCHEMAS = [
  {
    name: DBStores.TextBlocks,
    key: 'id',
    columns: <string[]>[],
  },
] as const;
