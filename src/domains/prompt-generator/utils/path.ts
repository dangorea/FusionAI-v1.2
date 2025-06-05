import pathBrowser from 'path-browserify';
import type { Key } from 'react';

/**
 * If path is not absolute, join with projectPath.
 */
export function getAbsoluteFilePath(
  filePath: string,
  projectPath: string,
): string {
  if (pathBrowser.isAbsolute(filePath)) {
    return pathBrowser.normalize(filePath);
  }
  let relativeKey = filePath;
  const projFolderName = projectPath.split(/[\\/]/).pop() || '';
  if (relativeKey.startsWith(projFolderName)) {
    relativeKey = relativeKey
      .slice(projFolderName.length)
      .replace(/^[/\\]+/, '');
  }
  return pathBrowser.normalize(pathBrowser.join(projectPath, relativeKey));
}

/**
 * Return filePath relative to projectPath if possible.
 */
export function getRelativePath(filePath: string, projectPath: string): string {
  return projectPath && filePath.startsWith(projectPath)
    ? filePath.slice(projectPath.length).replace(/^[/\\]+/, '')
    : filePath;
}

/**
 * Returns the array of absolute paths for the context's sourceFiles.
 */
export function getCheckedPaths(
  sourceFiles: { path: string }[],
  projectPath: string,
): Key[] {
  return sourceFiles.map((sf) => getAbsoluteFilePath(sf.path, projectPath));
}
