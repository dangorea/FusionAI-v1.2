import React, { useEffect, useMemo, useState } from 'react';
import { Tree } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import { defaultStyles, FileIcon } from 'react-file-icon';
import { EnhancedFileNode, mergeFileSets } from './utils/mergeFileSets';
import styles from './FileTreeV2.module.scss';

const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const fallbackStyle: Partial<React.ComponentProps<typeof FileIcon>> = {};

export interface CustomDataNode extends Omit<DataNode, 'title'> {
  title: string;
  isDirectory: boolean;
  style?: React.CSSProperties;
}

export interface FileTreeV2Props {
  fileSets?: { [setId: string]: { path: string; isDirectory: boolean }[] };

  treeData?: EnhancedFileNode[];
  preselectedFiles?: string[];
  onSelectionChange?: (selectedFiles: string[]) => void;
  customStyles?: {
    [setId: string]: {
      folder?: React.CSSProperties;
      file?: React.CSSProperties;
      common?: React.CSSProperties;
    };
  };
}

const FileTreeV2: React.FC<FileTreeV2Props> = ({
  fileSets = {},
  treeData,
  preselectedFiles = [],
  onSelectionChange,
  customStyles = {},
}) => {
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(preselectedFiles);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const transformNodes = (nodes: EnhancedFileNode[]): CustomDataNode[] => {
    return nodes.map((node) => {
      const title = node.path.split('/').pop() || node.path;
      let combinedStyle: React.CSSProperties = { ...node.style };
      if (node.setIds && customStyles) {
        node.setIds.forEach((setId) => {
          const setStyle = customStyles[setId];
          if (setStyle) {
            combinedStyle = {
              ...combinedStyle,
              ...(node.isDirectory ? setStyle.folder : setStyle.file),
            };
          }
        });
      }
      return {
        key: node.path,
        title,
        isLeaf: !node.isDirectory,
        children: node.children ? transformNodes(node.children) : undefined,
        style: combinedStyle,
        isDirectory: node.isDirectory,
      } as CustomDataNode;
    });
  };

  const processedTreeData: CustomDataNode[] = useMemo(() => {
    if (treeData) {
      return transformNodes(treeData);
    }
    return transformNodes(
      mergeFileSets(fileSets, new Set(Object.keys(fileSets)), customStyles),
    );
  }, [treeData, fileSets, customStyles]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(checkedKeys as string[]);
    }
  }, [checkedKeys, onSelectionChange]);

  const onCheck: TreeProps<CustomDataNode>['onCheck'] = (newCheckedKeys) => {
    setCheckedKeys(newCheckedKeys as React.Key[]);
    if (onSelectionChange) {
      onSelectionChange(newCheckedKeys as string[]);
    }
  };

  const onSelect: TreeProps<CustomDataNode>['onSelect'] = (
    newSelectedKeys,
    _info,
  ) => {
    setSelectedKeys(newSelectedKeys as React.Key[]);
  };

  const onExpand: TreeProps<CustomDataNode>['onExpand'] = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys as React.Key[]);
  };

  const renderTitle = (nodeData: DataNode): React.ReactNode => {
    const customNode = nodeData as CustomDataNode;
    return <span style={customNode.style}>{customNode.title}</span>;
  };

  return (
    <div className={styles.fileTreeV2}>
      <Tree<CustomDataNode>
        checkable
        treeData={processedTreeData}
        checkedKeys={checkedKeys}
        selectedKeys={selectedKeys}
        onCheck={onCheck}
        onSelect={onSelect}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        showIcon
        titleRender={renderTitle}
        icon={(nodeProps) => {
          const customNode = (nodeProps as unknown as { data: CustomDataNode })
            .data;
          if (customNode && customNode.isDirectory) {
            return nodeProps.expanded ? (
              <FolderOpenOutlined />
            ) : (
              <FolderOutlined />
            );
          }
          const fileName = customNode ? customNode.title : '';
          const ext = getFileExtension(fileName);
          const styleProps =
            ext in defaultStyles
              ? defaultStyles[ext as keyof typeof defaultStyles]
              : fallbackStyle;
          return (
            <span style={{ display: 'inline-block', width: 14, height: 14 }}>
              <FileIcon extension={ext} {...styleProps} />
            </span>
          );
        }}
      />
    </div>
  );
};

export default FileTreeV2;
