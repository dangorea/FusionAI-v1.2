import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  initialCheckedKeys?: React.Key[];
  style?: React.CSSProperties;
}

function findBaseNodeByPath(node: FileNode, path: string): FileNode | null {
  if (node.path === path) return node;
  if (node.children) {
    for (const child of node.children) {
      const result = findBaseNodeByPath(child, path);
      if (result) return result;
    }
  }
  return null;
}

function toAntDataNode(
  node: FileNode,
  showModifiedOnly: boolean,
  baseTree?: FileNode,
): DataNode | null {
  let enrichedChildren = node.children;
  const baseNode: FileNode | null = baseTree
    ? findBaseNodeByPath(baseTree, node.path)
    : null;
  if (
    enrichedChildren === undefined &&
    baseNode &&
    baseNode.children !== undefined
  ) {
    enrichedChildren = baseNode.children;
  }

  const isFolder = baseNode
    ? baseNode.children !== undefined
    : Array.isArray(enrichedChildren) && enrichedChildren.length > 0;
  const isLeaf = !isFolder;

  if (showModifiedOnly && isLeaf && !node.changeType) {
    return null;
  }

  let childNodes: DataNode[] = [];
  if (enrichedChildren) {
    childNodes = enrichedChildren
      .map((child) => toAntDataNode(child, showModifiedOnly, baseTree))
      .filter(Boolean) as DataNode[];
  }

  let icon: React.ReactNode = isFolder ? <FolderFilled /> : <FileOutlined />;
  if (isLeaf) {
    if (node.changeType === 'deleted') {
      icon = <DeleteOutlined style={{ color: 'red' }} />;
    } else {
      const ext = node.name.split('.').pop()?.toLowerCase();
      if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
        icon = <CodeOutlined />;
      } else if (ext === 'md' || ext === 'json') {
        icon = <FileTextOutlined />;
      }
    }
  }

  const textStyle: React.CSSProperties = { marginLeft: 4 };
  if (isLeaf) {
    if (node.changeType === 'modified') {
      textStyle.color = '#d6b600';
    } else if (node.changeType === 'added') {
      textStyle.color = 'green';
    } else if (node.changeType === 'deleted') {
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
    title: isFolder ? (
      <div className="directory-node">{titleContent}</div>
    ) : (
      titleContent
    ),
    selectable: true,
    children: childNodes,
    isLeaf,
  };
}

function mergeTrees(base: FileNode, gen: FileNode): FileNode {
  const merged: FileNode = { ...gen };
  const baseChildren = base.children || [];
  const genChildren = gen.children || [];

  if (baseChildren.length || genChildren.length) {
    const baseMap = new Map<string, FileNode>();
    baseChildren.forEach((child) => baseMap.set(child.path, child));

    const mergedChildrenMap = new Map<string, FileNode>();
    genChildren.forEach((child) => {
      if (baseMap.has(child.path)) {
        const mergedChild = mergeTrees(baseMap.get(child.path)!, child);
        mergedChildrenMap.set(child.path, mergedChild);
      } else {
        mergedChildrenMap.set(child.path, child);
      }
    });

    baseChildren.forEach((bChild) => {
      if (!mergedChildrenMap.has(bChild.path)) {
        mergedChildrenMap.set(bChild.path, bChild);
      }
    });
    merged.children = Array.from(mergedChildrenMap.values());
  }
  return merged;
}

function filterModifiedOnly(node: FileNode, isRoot = false): FileNode | null {
  if (!node.children || node.children.length === 0) {
    return node.changeType ? node : null;
  }
  const filteredChildren = node.children
    .map((child) => filterModifiedOnly(child))
    .filter((child): child is FileNode => child !== null);

  if (filteredChildren.length > 0 || isRoot) {
    return { ...node, children: filteredChildren };
  }
  return node.changeType ? { ...node, children: [] } : null;
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
  initialCheckedKeys,
  style,
}: FileTreeProps) {
  const [loading, setLoading] = useState(false);
  const [localRenderTree, setLocalRenderTree] = useState<FileNode | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandedOnce, setAutoExpandedOnce] = useState(false);
  const [showModifiedOnly, setShowModifiedOnly] = useState<boolean>(true);

  useEffect(() => {
    if (initialCheckedKeys && initialCheckedKeys.length > 0) {
      setCheckedKeys(initialCheckedKeys);
    }
  }, [initialCheckedKeys]);

  const computedRenderTree = useMemo(() => {
    if (fileSets && fileSets.length > 0) {
      if (fileSets.length === 2) {
        const mergedTree = mergeTrees(fileSets[0].tree, fileSets[1].tree);
        return showModifiedOnly
          ? filterModifiedOnly(mergedTree, true)
          : mergedTree;
      }
      return fileSets[0].tree;
    }
    return null;
  }, [fileSets, showModifiedOnly]);

  useEffect(() => {
    if (computedRenderTree) {
      setLocalRenderTree(computedRenderTree);
    } else if (projectPath) {
      setLoading(true);
      window?.fileAPI
        .getFileTree(projectPath)
        .then((tree: FileNode) => setLocalRenderTree(tree))
        .catch((err: any) => {
          console.error('Error loading file tree:', err);
          notification.error({
            message: 'Failed to load file tree',
            description: String(err),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [computedRenderTree, projectPath]);

  const treeData = useMemo(() => {
    if (!localRenderTree) return [];
    const dataNode = toAntDataNode(
      localRenderTree,
      fileSets && fileSets.length === 2 ? showModifiedOnly : false,
      fileSets && fileSets.length >= 1 ? fileSets[0].tree : undefined,
    );
    return dataNode ? [dataNode] : [];
  }, [localRenderTree, fileSets, showModifiedOnly]);

  const nodeMapping = useMemo(() => {
    const map = new Map<string, DataNode>();
    const traverse = (node: DataNode) => {
      map.set(String(node.key), node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    treeData.forEach(traverse);
    return map;
  }, [treeData]);

  useEffect(() => {
    setAutoExpandedOnce(false);
  }, [fileSets?.[1]]);

  useEffect(() => {
    if (!treeData.length) return;
    if (fileSets && fileSets.length === 2 && !autoExpandedOnce) {
      const gatherAllFolderKeys = (nodes: DataNode[]): string[] => {
        let keys: string[] = [];
        nodes.forEach((node) => {
          if (!node.isLeaf) {
            keys.push(String(node.key));
            if (node.children) {
              keys = keys.concat(gatherAllFolderKeys(node.children));
            }
          }
        });
        return keys;
      };
      const gatherFolderKeysFromFileNode = (node: FileNode): string[] => {
        let keys: string[] = [];
        if (node.children && node.children.length > 0) {
          keys.push(node.path);
          for (const child of node.children) {
            keys = keys.concat(gatherFolderKeysFromFileNode(child));
          }
        }
        return keys;
      };

      const mergedFolderKeys = gatherAllFolderKeys(treeData);
      const genFolderKeys =
        fileSets && fileSets.length === 2
          ? gatherFolderKeysFromFileNode(fileSets[1].tree)
          : [];
      const allKeysSet = new Set([...mergedFolderKeys, ...genFolderKeys]);
      setExpandedKeys(Array.from(allKeysSet));
      setAutoExpandedOnce(true);
    } else if (expandedKeys.length === 0 && treeData.length > 0) {
      setExpandedKeys([String(treeData[0].key)]);
    }
  }, [treeData, autoExpandedOnce, fileSets, expandedKeys.length]);

  useEffect(() => {
    const validKeysSet = new Set<string>();
    const gatherKeys = (nodes: DataNode[]) => {
      nodes.forEach((node) => {
        validKeysSet.add(String(node.key));
        if (node.children) gatherKeys(node.children);
      });
    };
    gatherKeys(treeData);
    setCheckedKeys((prev) => prev.filter((k) => validKeysSet.has(String(k))));
    setSelectedKeys((prev) => prev.filter((k) => validKeysSet.has(String(k))));
  }, [treeData]);

  const validKeys = useMemo(() => {
    const keys = new Set<string>();
    const gatherValidKeys = (nodes: DataNode[]) => {
      nodes.forEach((node) => {
        keys.add(String(node.key));
        if (node.children) gatherValidKeys(node.children);
      });
    };
    gatherValidKeys(treeData);
    return keys;
  }, [treeData]);

  const leafMapping = useMemo(() => {
    const mapping: Record<string, React.Key[]> = {};
    const computeLeafKeys = (node: DataNode) => {
      if (node.isLeaf) {
        mapping[String(node.key)] = [node.key];
      } else if (node.children) {
        let leaves: React.Key[] = [];
        node.children.forEach((child) => {
          computeLeafKeys(child);
          leaves = leaves.concat(mapping[String(child.key)] || []);
        });
        mapping[String(node.key)] = leaves;
      }
    };
    treeData.forEach((node) => computeLeafKeys(node));
    return mapping;
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
      let newCheckedKeys: React.Key[] = [];

      if (
        fileSets &&
        fileSets.length === 2 &&
        showModifiedOnly &&
        treeData.length > 0
      ) {
        for (const key of checkedArr) {
          const node = nodeMapping.get(String(key));
          if (node) {
            if (!node.isLeaf) {
              const leaves = leafMapping[String(node.key)] || [];
              newCheckedKeys.push(...leaves);
            } else {
              newCheckedKeys.push(key);
            }
          }
        }
        newCheckedKeys = Array.from(
          new Set(newCheckedKeys.filter((k) => validKeys.has(String(k)))),
        );
      } else {
        newCheckedKeys = checkedArr;
      }
      setCheckedKeys(newCheckedKeys);

      const leafKeysSet = new Set<string>();
      for (const key of newCheckedKeys) {
        const node = nodeMapping.get(String(key));
        if (node && node.isLeaf) {
          leafKeysSet.add(String(node.key));
        }
      }
      onFileSelectionChange?.(Array.from(leafKeysSet));
    },
    [
      onFileSelectionChange,
      treeData,
      fileSets,
      showModifiedOnly,
      validKeys,
      leafMapping,
      nodeMapping,
    ],
  );

  const handleSelect = useCallback(
    (selectedArr: React.Key[], info: any) => {
      if (info.node.isLeaf) {
        setSelectedKeys([info.node.key]);
        onSingleSelect?.(String(info.node.key));
      } else {
        setSelectedKeys(selectedArr);
      }
    },
    [onSingleSelect],
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
        minHeight: 0,
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
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
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
            return nodeData.title as ReactNode;
          }}
        />
      </div>
    </div>
  );
}
