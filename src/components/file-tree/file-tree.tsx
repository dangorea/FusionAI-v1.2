import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { notification, Spin, Switch, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  CodeOutlined,
  DeleteOutlined,
  FileOutlined,
  FileTextOutlined,
  FolderFilled,
} from '@ant-design/icons';

export interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
  changeType?: 'added' | 'modified' | 'deleted';
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

export interface FileTreeProps {
  fileSets?: FileSet[];
  projectPath?: string;
  onFileSelectionChange?: (selected: string[]) => void;
  onSingleSelect?: (filePath: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function collectChangedPathKeys(node: FileNode): string[] {
  let keys: string[] = [];
  if (node.children && node.children.length > 0) {
    let descendantHasChange = false;
    for (const child of node.children) {
      if (!child.children || child.children.length === 0) {
        if (child.changeType) {
          descendantHasChange = true;
        }
      } else {
        const childKeys = collectChangedPathKeys(child);
        if (childKeys.length > 0) {
          descendantHasChange = true;
          keys = keys.concat(childKeys);
        }
      }
    }
    if (descendantHasChange) {
      keys.push(node.path);
    }
  }
  return keys;
}

function toAntDataNode(
  node: FileNode,
  showModifiedOnly: boolean,
): DataNode | null {
  const isLeaf = !node.children || node.children.length === 0;
  const effectiveChange = node.changeType;

  let childNodes: DataNode[] = [];
  if (node.children && node.children.length > 0) {
    childNodes = node.children
      .map((child) => toAntDataNode(child, showModifiedOnly))
      .filter(Boolean) as DataNode[];
  }

  const hasNoChange = !effectiveChange && childNodes.length === 0;
  if (showModifiedOnly && hasNoChange) {
    return null;
  }

  let icon: React.ReactNode = isLeaf ? <FileOutlined /> : <FolderFilled />;
  if (isLeaf && effectiveChange === 'deleted') {
    icon = <DeleteOutlined style={{ color: 'red' }} />;
  } else if (isLeaf) {
    const ext = node.name.split('.').pop()?.toLowerCase();
    if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
      icon = <CodeOutlined />;
    } else if (ext === 'md' || ext === 'json') {
      icon = <FileTextOutlined />;
    }
  }

  const textStyle: React.CSSProperties = { marginLeft: 4 };
  if (isLeaf) {
    if (effectiveChange === 'modified') {
      textStyle.color = '#d6b600';
    } else if (effectiveChange === 'added') {
      textStyle.color = 'green';
    } else if (effectiveChange === 'deleted') {
      textStyle.color = 'red';
    }
  }

  const titleContent = (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
    >
      {icon}
      <span style={textStyle}>{node.name}</span>
    </span>
  );

  return {
    key: node.path,
    title: !isLeaf ? (
      <div className="directory-node">{titleContent}</div>
    ) : (
      titleContent
    ),
    isLeaf,
    selectable: isLeaf,
    children: childNodes,
  };
}

function findPathInTree(
  nodes: DataNode[],
  targetKey: React.Key,
): string[] | null {
  for (const node of nodes) {
    if (node.key === targetKey) {
      return [String(node.key)];
    }
    if (node.children) {
      const childPath = findPathInTree(node.children, targetKey);
      if (childPath) {
        return [String(node.key), ...childPath];
      }
    }
  }
  return null;
}

interface FolderTitleProps {
  nodeData: DataNode;
  toggleExpand: (key: React.Key) => void;
}

function FolderTitle({ nodeData, toggleExpand }: FolderTitleProps): ReactNode {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    toggleExpand(nodeData.key);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand(nodeData.key);
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {nodeData.title as ReactNode}
    </span>
  );
}

export function FileTree({
  fileSets,
  projectPath,
  onFileSelectionChange,
  onSingleSelect,
  className,
  style,
}: FileTreeProps) {
  const [loading, setLoading] = useState(false);
  const [renderTree, setRenderTree] = useState<FileNode | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [showModifiedOnly, setShowModifiedOnly] = useState<boolean>(true);

  useEffect(() => {
    if (fileSets && fileSets.length > 0) {
      if (fileSets.length === 2) {
        window.fileAPI
          .mergeFileTrees(fileSets[0].tree, fileSets[1].tree)
          .then((merged: FileNode) => setRenderTree(merged))
          .catch((err: any) => {
            console.error('Error merging file trees:', err);
            notification.error({
              message: 'Error merging file trees',
              description: String(err),
            });
          });
      } else {
        setRenderTree(fileSets[0].tree);
      }
    } else if (projectPath) {
      setLoading(true);
      window?.fileAPI
        .getFileTree(projectPath)
        .then((tree: FileNode) => setRenderTree(tree))
        .catch((err: any) => {
          console.error('Error loading file tree:', err);
          notification.error({
            message: 'Failed to load file tree',
            description: String(err),
          });
          return err;
        })
        .finally(() => setLoading(false));
    }
  }, [fileSets, projectPath]);

  const treeData = useMemo(() => {
    if (!renderTree) return [];
    const dataNode = toAntDataNode(
      renderTree,
      fileSets && fileSets.length === 2 ? showModifiedOnly : false,
    );
    return dataNode ? [dataNode] : [];
  }, [renderTree, fileSets, showModifiedOnly]);

  const autoExpandedKeys = useMemo(() => {
    if (!renderTree) return [];
    const keysSet = new Set<string>([renderTree.path]);
    if (fileSets && fileSets.length === 2) {
      const changedKeys = collectChangedPathKeys(renderTree);
      changedKeys.forEach((key) => keysSet.add(key));
    }
    return Array.from(keysSet);
  }, [renderTree, fileSets]);

  useEffect(() => {
    if (!treeData.length) return;

    if (selectedKeys.length === 0) {
      if (fileSets && fileSets.length === 2) {
        const defaultExpanded = new Set<string>();
        defaultExpanded.add(String(treeData[0].key));
        autoExpandedKeys.forEach((k) => defaultExpanded.add(k));
        const newExpandedKeys = Array.from(defaultExpanded);
        setExpandedKeys((prev) => {
          if (
            prev.length !== newExpandedKeys.length ||
            !newExpandedKeys.every((k) => prev.includes(k))
          ) {
            return newExpandedKeys;
          }
          return prev;
        });
      } else {
        if (expandedKeys.length === 0) {
          setExpandedKeys([String(treeData[0].key)]);
        }
      }
      return;
    }

    setExpandedKeys((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      newExpanded.add(String(treeData[0].key));
      autoExpandedKeys.forEach((k) => newExpanded.add(k));
      selectedKeys.forEach((selectedKey) => {
        const path = findPathInTree(treeData, selectedKey);
        if (path) {
          path.forEach((k) => newExpanded.add(k));
        }
      });
      const newExpandedKeys = Array.from(newExpanded);
      if (
        prevExpanded.length !== newExpandedKeys.length ||
        !newExpandedKeys.every((k) => prevExpanded.includes(k))
      ) {
        return newExpandedKeys;
      }
      return prevExpanded;
    });
  }, [treeData, selectedKeys, autoExpandedKeys, fileSets]);

  useEffect(() => {
    const validLeafKeys = new Set<string>();
    const gatherLeafKeys = (nodes: DataNode[]) => {
      nodes.forEach((node) => {
        if (node.isLeaf) {
          validLeafKeys.add(String(node.key));
        }
        if (node.children) {
          gatherLeafKeys(node.children);
        }
      });
    };
    gatherLeafKeys(treeData);

    setCheckedKeys((prev) => prev.filter((k) => validLeafKeys.has(String(k))));
    setSelectedKeys((prev) => prev.filter((k) => validLeafKeys.has(String(k))));
  }, [treeData]);

  const handleCheck = useCallback(
    (
      checkedValue:
        | React.Key[]
        | { checked: React.Key[]; halfChecked: React.Key[] },
    ) => {
      const checkedArr = Array.isArray(checkedValue)
        ? checkedValue
        : checkedValue.checked;

      const leafKeys: string[] = [];
      const traverse = (nodes: DataNode[]) => {
        nodes.forEach((node) => {
          if (node.isLeaf && checkedArr.includes(node.key)) {
            leafKeys.push(String(node.key));
          }
          if (node.children) {
            traverse(node.children);
          }
        });
      };
      traverse(treeData);

      setCheckedKeys(leafKeys);
      onFileSelectionChange?.(leafKeys);
    },
    [treeData, onFileSelectionChange],
  );

  const handleSelect = useCallback(
    (selectedArr: React.Key[]) => {
      if (selectedArr.length === 0 && selectedKeys.length === 1) {
        return;
      }
      setSelectedKeys(selectedArr);
      onSingleSelect?.(selectedArr.length === 1 ? String(selectedArr[0]) : '');
    },
    [onSingleSelect, selectedKeys],
  );

  const handleExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys);
  }, []);

  const toggleExpand = useCallback((key: React.Key) => {
    setExpandedKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  }, []);

  if (loading) {
    return <Spin tip="Loading file tree..." />;
  }
  if (!treeData.length) {
    return <div>No files to show.</div>;
  }

  return (
    <div
      className={`file-tree-container ${className || ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style,
      }}
    >
      {fileSets && fileSets.length === 2 && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#fff',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Switch
            checked={showModifiedOnly}
            onChange={(val) => setShowModifiedOnly(val)}
          />
          <span style={{ marginLeft: 8 }}>Show only changed files</span>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        <style>{`
          .ant-tree-switcher {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .directory-node {
            cursor: default !important;
          }
          .ant-tree-node-content-wrapper.ant-tree-node-selected > .directory-node {
            background-color: transparent !important;
            color: inherit !important;
          }
        `}</style>

        <Tree
          checkable
          treeData={treeData}
          checkedKeys={checkedKeys}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onCheck={handleCheck}
          onSelect={handleSelect}
          onExpand={handleExpand}
          titleRender={(nodeData) => {
            if (!nodeData.isLeaf) {
              return (
                <FolderTitle nodeData={nodeData} toggleExpand={toggleExpand} />
              );
            }
            return nodeData.title as Iterable<ReactNode>;
          }}
        />
      </div>
    </div>
  );
}
