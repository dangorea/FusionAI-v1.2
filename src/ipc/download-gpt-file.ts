import { ipcMain } from 'electron';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { SaveFilePayload } from './types';
import { getProjectRoot, setProjectRoot } from './store';
import { normalizePath } from './utils/pathUtils';

ipcMain.on('set-project-path', (_, projectPath) => {
  const normalizedPath = normalizePath(projectPath);
  setProjectRoot(normalizedPath);
});

export function setupSaveFileWithDynamicPath() {
  ipcMain.handle('save-file', async (_, payload: SaveFilePayload) => {
    const { path, content } = payload;

    try {
      const currentProjectPath = getProjectRoot();
      if (!currentProjectPath) {
        throw new Error('Project path is not set');
      }

      const normalizedRelativePath = normalizePath(path);
      const fullPath = normalizePath(
        join(currentProjectPath, normalizedRelativePath),
      );

      mkdirSync(dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, content, 'utf8');

      return { success: true, filePath: fullPath };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, message: (error as Error).message };
    }
  });
}
