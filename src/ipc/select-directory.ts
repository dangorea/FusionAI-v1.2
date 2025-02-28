import { dialog, ipcMain } from 'electron';
import { getProjectRoot, setProjectRoot } from './store';
import { normalizePath, normalizePathsInResponse } from './utils/pathUtils';
import { buildFileTree } from './utils/fileTree';

export function setupSelectDirectory() {
  ipcMain.handle('selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled) {
      return { canceled: true };
    }

    const directoryPath = normalizePath(result.filePaths[0]);
    setProjectRoot(directoryPath);
    const projectRoot = getProjectRoot();
    const fileTree = buildFileTree(directoryPath, projectRoot);

    return normalizePathsInResponse({
      canceled: false,
      directoryPath,
      fileTree,
    });
  });
}
