import React from 'react';

export interface EnhancedFileNode {
  path: string;
  isDirectory: boolean;
  children?: EnhancedFileNode[];
  setIds?: string[];
  style?: React.CSSProperties;
}

interface PathMapEntry {
  children: Set<string>;
  isDirectory: boolean;
  setIds: Set<string>;
}

export const mergeFileSets = (
  fileSets: { [setId: string]: { path: string; isDirectory: boolean }[] },
  visibleSets: Set<string>,
  customStyles: {
    [setId: string]: {
      folder?: React.CSSProperties;
      file?: React.CSSProperties;
      common?: React.CSSProperties;
    };
  } = {},
): EnhancedFileNode[] => {
  const pathMap: { [path: string]: PathMapEntry } = {};

  Object.keys(fileSets).forEach((setId) => {
    if (!visibleSets.has(setId)) return;
    fileSets[setId].forEach((fileNode) => {
      const { path, isDirectory } = fileNode;
      const parts = path.split('/');
      parts.forEach((part, index) => {
        const currentPath = parts.slice(0, index + 1).join('/');
        if (!pathMap[currentPath]) {
          pathMap[currentPath] = {
            children: new Set(),
            isDirectory: index === parts.length - 1 ? isDirectory : true,
            setIds: new Set(),
          };
        } else if (index === parts.length - 1) {
          pathMap[currentPath].isDirectory =
            pathMap[currentPath].isDirectory || isDirectory;
        }
        pathMap[currentPath].setIds.add(setId);
        if (index > 0) {
          const parentPath = parts.slice(0, index).join('/');
          if (pathMap[parentPath]) {
            pathMap[parentPath].children.add(parts[index]);
          }
        }
      });
    });
  });

  const buildTree = (parentPath: string): EnhancedFileNode[] => {
    const childrenNames = Array.from(
      new Set(
        Object.keys(pathMap)
          .filter((p) => {
            const parent = parentPath === '' ? '' : parentPath;
            return p.startsWith(parent) && p !== parent;
          })
          .map((p) => {
            const relativePath =
              parentPath === '' ? p : p.substring(parentPath.length + 1);
            return relativePath.split('/')[0];
          }),
      ),
    );

    return childrenNames.map((child) => {
      const currentPath = parentPath === '' ? child : `${parentPath}/${child}`;
      const nodeEntry = pathMap[currentPath];
      let combinedStyle: React.CSSProperties = {};
      nodeEntry.setIds.forEach((setId) => {
        if (customStyles[setId]) {
          combinedStyle = { ...combinedStyle, ...customStyles[setId].common };
        }
      });
      return {
        path: currentPath,
        isDirectory: nodeEntry.isDirectory,
        children: nodeEntry.isDirectory ? buildTree(currentPath) : undefined,
        setIds: Array.from(nodeEntry.setIds),
        style:
          Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined,
      };
    });
  };

  return buildTree('');
};
