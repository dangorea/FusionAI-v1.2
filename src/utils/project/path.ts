import { LocalStorageKeys } from '../localStorageKeys';

/**
 * Constructs the local-storage key used to persist the project’s path.
 */
const pathKey = (projectId: string | number): string =>
  `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`;

/**
 * Constructs the local-storage key used to persist the project’s cached file-tree.
 */
const treeKey = (projectId: string | number): string =>
  `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`;

/* ─────────────────────────── PATH ─────────────────────────── */

export const getProjectPath = (projectId: string | number): string | null =>
  localStorage.getItem(pathKey(projectId));

export const saveProjectPath = (
  projectId: string | number,
  directoryPath: string,
): void => {
  localStorage.setItem(pathKey(projectId), directoryPath);
};

export const removeProjectPath = (projectId: string | number): void => {
  localStorage.removeItem(pathKey(projectId));
};

/* ───────────────────────── FILE TREE ───────────────────────── */

export const getProjectFileTree = <T = unknown>(
  projectId: string | number,
): T | null => {
  const raw = localStorage.getItem(treeKey(projectId));
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const saveProjectFileTree = (
  projectId: string | number,
  fileTree: unknown,
): void => {
  localStorage.setItem(treeKey(projectId), JSON.stringify(fileTree));
};

export const removeProjectFileTree = (projectId: string | number): void => {
  localStorage.removeItem(treeKey(projectId));
};
