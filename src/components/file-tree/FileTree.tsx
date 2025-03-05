import React, { useEffect, useRef, useState } from 'react';
import { Spin, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import fs from 'fs';
import path from 'path';

interface FileInfo {
  filePath: string;
  content: string;
}

interface FileTreeProps {
  /** The absolute path to the root folder of the project. */
  rootPath: string;

  /**
   * Callback that returns multiple selected files (via checkboxes)
   * along with their content.
   */
  onMultipleSelect?: (files: FileInfo[]) => void;

  /**
   * Callback that returns the single selected file (via file name click)
   * along with its content for preview.
   */
  onSingleSelect?: (file: FileInfo) => void;
}

/**
 * A component that renders a file tree using Ant Design's Tree.
 * It supports:
 * - Multiple file selection via checkboxes
 * - Single file selection via file name click (preview)
 * - "Select all" in root and subfolders with partial check states
 * - Live updates if the file changes on disk while selected
 */
const FileTree: React.FC<FileTreeProps> = ({
  rootPath,
  onMultipleSelect,
  onSingleSelect,
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // For multiple selection (checkbox).
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  // For single file preview selection.
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // A map of filePath -> file content
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  // Keep references to watchers so we can close them if a file is unchecked or unselected.
  const watchersRef = useRef<Record<string, fs.FSWatcher>>({});

  /**
   * Recursively builds the file tree starting from `dirPath`.
   * Returns an array of `DataNode` suitable for Ant Design's Tree.
   */
  const buildFileTree = (dirPath: string): DataNode => {
    const name = path.basename(dirPath);

    // Check if dirPath is a directory or file
    let isDirectory = false;
    try {
      isDirectory = fs.statSync(dirPath).isDirectory();
    } catch (err) {
      // Handle error if needed, or ignore if file/folder doesn't exist
    }

    if (!isDirectory) {
      // It's a file node
      return {
        key: dirPath,
        title: name,
        isLeaf: true,
      };
    }

    // If directory, read children
    let childrenNodes: DataNode[] = [];
    try {
      const children = fs.readdirSync(dirPath);
      childrenNodes = children.map((child) =>
        buildFileTree(path.join(dirPath, child)),
      );
    } catch (err) {
      // Handle read error if needed
    }

    return {
      key: dirPath,
      title: name,
      children: childrenNodes,
      isLeaf: false,
    };
  };

  /**
   * Loads the entire tree data from rootPath.
   */
  const loadTreeData = () => {
    setLoading(true);
    const tree = buildFileTree(rootPath);
    // We wrap it in an array so that we have a single root node with children.
    setTreeData([tree]);
    setLoading(false);
  };

  /**
   * Reads the file content from disk.
   */
  const readFileContent = (filePath: string): string => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      return '';
    }
  };

  /**
   * Watches a file for changes. If it changes, update file content in state.
   */
  const watchFile = (filePath: string) => {
    if (watchersRef.current[filePath]) {
      // Already watching
      return;
    }
    try {
      const watcher = fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
          const newContent = readFileContent(filePath);
          setFileContents((prev) => ({ ...prev, [filePath]: newContent }));
        }
      });
      watchersRef.current[filePath] = watcher;
    } catch (err) {
      // Handle watch error if needed
    }
  };

  /**
   * Unwatches a file if we are currently watching it.
   */
  const unwatchFile = (filePath: string) => {
    if (watchersRef.current[filePath]) {
      watchersRef.current[filePath].close();
      delete watchersRef.current[filePath];
    }
  };

  /**
   * Handle checking/unchecking files for multiple selection.
   */
  const onCheck = (
    checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
  ) => {
    // Because checkStrictly={false} by default, the param can be an object
    // with { checked, halfChecked }. We just want the `checked` array.
    const checkedArr = Array.isArray(checked) ? checked : checked.checked;

    setCheckedKeys(checkedArr);

    // For each checked file that is a leaf, read content if not already read.
    // Also watch them for changes.
    const newContents: Record<string, string> = {};
    checkedArr.forEach((key) => {
      const filePath = String(key);
      const stats = safeStat(filePath);
      if (stats?.isFile()) {
        // If not in fileContents, read it and watch
        if (!fileContents[filePath]) {
          newContents[filePath] = readFileContent(filePath);
        }
        watchFile(filePath);
      }
    });

    // For any file that is no longer checked, unwatch it.
    checkedKeys.forEach((oldKey) => {
      if (!checkedArr.includes(oldKey)) {
        const filePath = String(oldKey);
        unwatchFile(filePath);
      }
    });

    if (Object.keys(newContents).length > 0) {
      setFileContents((prev) => ({ ...prev, ...newContents }));
    }

    // Build an array of FileInfo for the callback
    if (onMultipleSelect) {
      const selectedFileInfos: FileInfo[] = [];
      checkedArr.forEach((key) => {
        const fp = String(key);
        const stats = safeStat(fp);
        if (stats?.isFile()) {
          selectedFileInfos.push({
            filePath: fp,
            content: fileContents[fp] || newContents[fp] || '',
          });
        }
      });
      onMultipleSelect(selectedFileInfos);
    }
  };

  /**
   * Handle single file selection (clicking the file name).
   */
  const onSelect = (selected: React.Key[]) => {
    setSelectedKeys(selected);

    if (selected.length === 1) {
      const filePath = String(selected[0]);
      const stats = safeStat(filePath);
      if (stats?.isFile()) {
        // If not in fileContents, read it
        if (!fileContents[filePath]) {
          const content = readFileContent(filePath);
          setFileContents((prev) => ({ ...prev, [filePath]: content }));
        }
        // Watch this file for changes
        watchFile(filePath);

        // Return single file info
        if (onSingleSelect) {
          onSingleSelect({
            filePath,
            content: fileContents[filePath] || readFileContent(filePath),
          });
        }
      }
    }
  };

  /**
   * Safely gets fs.Stats for a path, returning undefined if it fails.
   */
  const safeStat = (filePath: string): fs.Stats | undefined => {
    try {
      return fs.statSync(filePath);
    } catch {
      return undefined;
    }
  };

  /**
   * Cleanup watchers on unmount.
   */
  useEffect(() => {
    return () => {
      Object.keys(watchersRef.current).forEach((filePath) => {
        watchersRef.current[filePath].close();
      });
      watchersRef.current = {};
    };
  }, []);

  /**
   * Load the tree data whenever rootPath changes.
   */
  useEffect(() => {
    loadTreeData();
  }, [rootPath]);

  if (loading) {
    return <Spin tip="Loading file tree..." />;
  }

  return (
    <Tree
      checkable
      checkStrictly={false}
      treeData={treeData}
      onCheck={onCheck}
      onSelect={onSelect}
      checkedKeys={checkedKeys}
      selectedKeys={selectedKeys}
      defaultExpandedKeys={[rootPath]}
    />
  );
};

export default FileTree;
