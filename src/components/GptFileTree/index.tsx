import React from 'react';
import { Tree, Checkbox } from 'antd';
import { DataNode } from 'antd/es/tree';
import { GptFileTreeNode } from '../../state/types';
import { FolderOpenOutlined } from '@ant-design/icons';

interface GptFileTreeProps {
  treeData: GptFileTreeNode[];
  selectedKeys: string[];
  onSelectionChange: (selectedKeys: string[]) => void;
  onCheckboxChange: (file: GptFileTreeNode) => void;
}

const transformToDataNode = (
  nodes: GptFileTreeNode[],
  onCheckboxChange: (file: GptFileTreeNode) => void,
): DataNode[] => {
  return nodes.map((node) => {
    const isLeaf = node.type === 'file';

    return {
      key: node.path,
      title: isLeaf ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            onChange={() => onCheckboxChange(node)}
            style={{ marginRight: '8px' }}
          />
          {node.name}
        </div>
      ) : (
        <>
          <FolderOpenOutlined
            style={{ fontSize: '16px', marginRight: '5px' }}
          />
          <span style={{ fontWeight: 'bold' }}>{node.name}</span>
        </>
      ),
      isLeaf,
      selectable: isLeaf,
      children: node.children
        ? transformToDataNode(node.children, onCheckboxChange)
        : undefined,
    };
  });
};

export const GptFileTree: React.FC<GptFileTreeProps> = ({
  treeData,
  selectedKeys,
  onSelectionChange,
  onCheckboxChange,
}) => {
  const handleSelect = (selectedKeys: React.Key[]) => {
    onSelectionChange(selectedKeys as string[]);
  };

  const dataNodes = transformToDataNode(treeData, onCheckboxChange);

  return (
    <Tree
      treeData={dataNodes}
      selectedKeys={selectedKeys}
      onSelect={handleSelect}
      showLine={{ showLeafIcon: false }}
      defaultExpandAll
      style={{
        background: '#fff',
        padding: '8px',
      }}
    />
  );
};
