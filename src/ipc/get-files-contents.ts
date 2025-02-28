import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { GetFilesContentsResult } from './types';
import { getProjectRoot } from './store';
import { normalizePathsInResponse } from './utils/pathUtils';

function readPathContentsRecursively(
  absolutePath: string,
  root: string,
): { path: string; content: string }[] {
  const stat = fs.statSync(absolutePath);

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(absolutePath);
    let results: { path: string; content: string }[] = [];

    for (const entry of entries) {
      const fullPath = path.join(absolutePath, entry);
      results = results.concat(readPathContentsRecursively(fullPath, root));
    }

    return results;
  } else {
    return [
      {
        path: path.relative(root, absolutePath),
        content: fs.readFileSync(absolutePath, 'utf8'),
      },
    ];
  }
}

export function setupGetFilesContents() {
  ipcMain.handle(
    'getFilesContents',
    async (_, paths: string[]): Promise<GetFilesContentsResult> => {
      const projectRoot = getProjectRoot();
      if (!projectRoot) throw new Error('Project root not set');

      const allContents: { path: string; content: string }[] = [];

      for (const relativePath of paths) {
        const fullPath = path.join(projectRoot, relativePath);
        const results = readPathContentsRecursively(fullPath, projectRoot);
        allContents.push(...results);
      }

      return normalizePathsInResponse({ contents: allContents });
    },
  );
}
