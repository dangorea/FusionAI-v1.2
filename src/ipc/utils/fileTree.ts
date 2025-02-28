import fs from 'fs';
import path from 'path';
import { FileTreeNode } from '../types';

const excludedDirs = [
  'node_modules',
  'dist',
  '.git',
  'build',
  'out',
  'coverage',
];

const shouldExcludeDir = (dirName: string) => excludedDirs.includes(dirName);

export function buildFileTree(
  dirPath: string,
  projectRoot: string,
): FileTreeNode {
  const name = path.basename(dirPath);
  const relativePath = path.relative(projectRoot, dirPath);
  const item: FileTreeNode = {
    name,
    path: relativePath,
  } as FileTreeNode;

  try {
    const stats = fs.statSync(dirPath);

    if (stats.isDirectory()) {
      item.type = 'directory';
      item.children = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => {
          const isHiddenDirectory = entry.name.startsWith('.');
          const isExcludedDirectory =
            entry.isDirectory() && shouldExcludeDir(entry.name);
          return !isHiddenDirectory && !isExcludedDirectory;
        })
        .sort((a, b) => {
          const isSameType =
            (a.isFile() && b.isFile()) || (a.isDirectory() && b.isDirectory());
          return isSameType ? a.name.localeCompare(b.name) : -1;
        })
        .map((entry) =>
          buildFileTree(path.join(dirPath, entry.name), projectRoot),
        );
    } else {
      item.type = 'file';
    }
  } catch (error) {
    console.error(`Error handling path: ${dirPath}`, error);
  }

  return item;
}
