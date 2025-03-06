import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, notification, Spin, Switch, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  CodeOutlined,
  FileOutlined,
  FileTextOutlined,
  FolderFilled,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';

export interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
}

export interface FileSet {
  id: string;
  name: string;
  tree: FileNode;
  visible: boolean;
  style?: {
    folderIcon?: React.ReactNode;
    fileIcon?: React.ReactNode;
  };
}

interface FileTreeProps {
  rootPath?: string;
  fileSets?: FileSet[];
  preselectedFiles?: string[];
  modifiedPaths?: string[];
  onFileSelectionChange?: (selected: string[]) => void;
  onSingleSelect?: (filePath: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  rootPath,
  fileSets,
  preselectedFiles = [],
  modifiedPaths,
  onFileSelectionChange,
  onSingleSelect,
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(preselectedFiles);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [visibleFileSetIds, setVisibleFileSetIds] = useState<string[]>(
    fileSets ? fileSets.filter((fs) => fs.visible).map((fs) => fs.id) : [],
  );
  const [showModifiedOnly, setShowModifiedOnly] = useState<boolean>(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const expandedKeysRef = useRef(expandedKeys);

  useEffect(() => {
    expandedKeysRef.current = expandedKeys;
  }, [expandedKeys]);

  const defaultFolderIcon = <FolderFilled />;
  const defaultFileIcon = <FileOutlined />;

  const getFileIcon = (
    filePath: string,
    fileStyle?: { fileIcon?: React.ReactNode },
  ): React.ReactNode => {
    if (fileStyle?.fileIcon) return fileStyle.fileIcon;
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <CodeOutlined />;
      case 'json':
      case 'md':
        return <FileTextOutlined />;
      default:
        return defaultFileIcon;
    }
  };

  const getFolderIcon = (folderStyle?: {
    folderIcon?: React.ReactNode;
  }): React.ReactNode => {
    if (folderStyle?.folderIcon) return folderStyle.folderIcon;
    return defaultFolderIcon;
  };

  const isKeyInTree = (key: React.Key, node: DataNode): boolean => {
    if (node.key === key) return true;
    if (node.children) {
      for (const child of node.children) {
        if (isKeyInTree(key, child)) return true;
      }
    }
    return false;
  };

  const buildAntTreeData = (
    node: FileNode,
    styleOverride?: {
      folderIcon?: React.ReactNode;
      fileIcon?: React.ReactNode;
    },
  ): DataNode => {
    const isLeaf = !node.children || node.children.length === 0;
    const children = node.children?.map((child) =>
      buildAntTreeData(child, styleOverride),
    );

    return {
      key: node.path,
      title: (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {isLeaf
            ? getFileIcon(node.path, styleOverride)
            : getFolderIcon(styleOverride)}
          <span style={{ marginLeft: 4 }}>{node.name}</span>
        </span>
      ),
      isLeaf,
      children,
    };
  };

  const combineFileSets = (): DataNode[] => {
    if (!fileSets) return [];
    const visibleSets = fileSets.filter((fs) =>
      visibleFileSetIds.includes(fs.id),
    );
    return visibleSets.map((fs) => {
      const data = buildAntTreeData(fs.tree, fs.style);
      return {
        key: fs.id,
        title: <span style={{ fontWeight: 'bold' }}>{fs.name}</span>,
        children: [data],
      };
    });
  };

  const preserveExpandedKeys = (
    oldKeys: React.Key[],
    newNodes: DataNode[],
  ): React.Key[] => {
    return oldKeys.filter((key) =>
      newNodes.some((node) => isKeyInTree(key, node)),
    );
  };

  const loadSingleTree = async (
    preserveExpansion = false,
    oldExpandedKeys: React.Key[] = [],
  ) => {
    if (!rootPath) return;
    setLoading(true);

    try {
      const tree: FileNode | null = await window.fileAPI.getFileTree(rootPath);
      if (tree) {
        const dataNode = buildAntTreeData(tree);
        setTreeData([dataNode]);
        if (preserveExpansion) {
          setExpandedKeys(preserveExpandedKeys(oldExpandedKeys, [dataNode]));
        } else {
          setExpandedKeys([dataNode.key]);
        }
      } else {
        setTreeData([]);
        setExpandedKeys([]);
      }
    } catch (err: any) {
      console.error('Error loading file tree:', err);
      notification.error({
        message: 'Error loading file tree',
        description: err.message || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTreeByModified = (nodes: DataNode[]): DataNode[] => {
    if (!modifiedPaths || modifiedPaths.length === 0) return nodes;

    const filterNode = (node: DataNode): DataNode | null => {
      const keyStr = String(node.key);
      let matched = modifiedPaths.includes(keyStr);
      let filteredChildren: DataNode[] | undefined;
      if (node.children) {
        filteredChildren = node.children
          .map((child) => filterNode(child))
          .filter(Boolean) as DataNode[];
        if (filteredChildren.length > 0) {
          matched = true;
        }
      }
      return matched ? { ...node, children: filteredChildren } : null;
    };

    return nodes.map((node) => filterNode(node)).filter(Boolean) as DataNode[];
  };

  useEffect(() => {
    if (fileSets) {
      let combined = combineFileSets();
      if (showModifiedOnly) {
        combined = filterTreeByModified(combined);
      }
      setTreeData(combined);

      const fileSetKeys = fileSets
        .filter((fs) => fs.visible)
        .map((fs) => fs.id);
      setExpandedKeys(fileSetKeys);
    } else if (rootPath) {
      const preserve = expandedKeys.length > 0;
      loadSingleTree(preserve, expandedKeys);
    }
  }, [rootPath, fileSets, visibleFileSetIds, showModifiedOnly]);

  useEffect(() => {
    if (!rootPath) return;
    if (window.fileAPI && typeof window.fileAPI.watchDirectory === 'function') {
      window.fileAPI.watchDirectory(rootPath);
    } else {
      console.warn('fileAPI is not available');
    }

    const debouncedUpdate = debounce(async () => {
      const previousExpanded = expandedKeysRef.current;
      await loadSingleTree(true, previousExpanded);
    }, 300);

    const fileTreeUpdatedHandler = (_event: any, updatedTree: FileNode) => {
      debouncedUpdate();
    };

    const unsubscribe = window.electron.ipcRenderer.on(
      'file-tree-updated',
      fileTreeUpdatedHandler as (...args: unknown[]) => void,
    );

    return () => {
      unsubscribe();
      debouncedUpdate.cancel?.();
    };
  }, [rootPath]);

  useEffect(() => {
    if (preselectedFiles.length > 0) {
      setCheckedKeys(preselectedFiles);
    }
  }, [preselectedFiles]);

  useEffect(() => {
    onFileSelectionChange?.(checkedKeys.map(String));
  }, [checkedKeys, onFileSelectionChange]);

  const findNodeByKey = (nodes: DataNode[], key: string): DataNode | null => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCheck = (
    checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
  ) => {
    const checkedArr = Array.isArray(checked) ? checked : checked.checked;
    const filePaths = checkedArr.filter((key) => {
      const node = findNodeByKey(treeData, String(key));
      return node?.isLeaf;
    });
    setCheckedKeys(filePaths);
  };

  const handleSelect = (selected: React.Key[]) => {
    setSelectedKeys(selected);
    if (selected.length === 1) {
      const filePath = String(selected[0]);
      const node = findNodeByKey(treeData, filePath);
      if (node?.isLeaf) {
        onSingleSelect?.(filePath);
      }
    } else {
      onSingleSelect?.('');
    }
  };

  const handleFileSetToggle = (id: string, checked: boolean) => {
    let newVisible = [...visibleFileSetIds];
    if (checked) {
      if (!newVisible.includes(id)) newVisible.push(id);
    } else {
      newVisible = newVisible.filter((v) => v !== id);
    }
    setVisibleFileSetIds(newVisible);
    notification.info({
      message: 'File Set Visibility Changed',
      description: `File set "${id}" is now ${checked ? 'visible' : 'hidden'}.`,
    });
  };

  if (loading) {
    return <Spin tip="Loading file tree..." />;
  }

  if (!treeData || treeData.length === 0) {
    return <div>No tree data available.</div>;
  }

  return (
    <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
      <div
        style={{
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {fileSets && (
          <div>
            {fileSets.map((fs) => (
              <Checkbox
                key={fs.id}
                checked={visibleFileSetIds.includes(fs.id)}
                onChange={(e) => handleFileSetToggle(fs.id, e.target.checked)}
                style={{ marginRight: '8px' }}
              >
                {fs.name}
              </Checkbox>
            ))}
          </div>
        )}
        {modifiedPaths && modifiedPaths.length > 0 && (
          <div>
            <Switch checked={showModifiedOnly} onChange={setShowModifiedOnly} />{' '}
            <span>Show Modified Only</span>
          </div>
        )}
      </div>

      <style>{`
        .ant-tree-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <Tree
        checkable
        checkStrictly={false}
        treeData={treeData}
        onCheck={handleCheck}
        onSelect={handleSelect}
        checkedKeys={checkedKeys}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
      />
    </div>
  );
};

export default FileTree;
