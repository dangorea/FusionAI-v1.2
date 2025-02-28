import { ipcMain, webContents } from 'electron';
import fs from 'fs';
import { getProjectRoot } from './store';
import { buildFileTree } from './utils/fileTree';

let currentWatcher: fs.FSWatcher | null = null;

export function setupWatchDirectory() {
  ipcMain.handle('watchDirectory', async (_, directoryPath: string) => {
    if (currentWatcher) {
      currentWatcher.close();
      currentWatcher = null;
    }

    if (
      !fs.existsSync(directoryPath) ||
      !fs.statSync(directoryPath).isDirectory()
    ) {
      throw new Error('Invalid directory path provided for watching.');
    }

    currentWatcher = fs.watch(
      directoryPath,
      { recursive: true },
      async (eventType, filename) => {
        if (filename) {
          try {
            const projectRoot = getProjectRoot();
            if (!projectRoot) {
              throw new Error('Project root is not set');
            }
            const updatedFileTree = buildFileTree(directoryPath, projectRoot);
            webContents.getAllWebContents().forEach((wc) => {
              wc.send('fileTreeUpdate', updatedFileTree);
            });
          } catch (error) {
            console.error('Error updating file tree:', error);
          }
        }
      },
    );

    try {
      const projectRoot = getProjectRoot();
      if (!projectRoot) {
        throw new Error('Project root is not set');
      }
      const fileTree = buildFileTree(directoryPath, projectRoot);
      webContents.getAllWebContents().forEach((wc) => {
        wc.send('fileTreeUpdate', fileTree);
      });
    } catch (error) {
      console.error('Error sending initial file tree:', error);
    }

    return { success: true };
  });
}
