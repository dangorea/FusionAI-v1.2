import { useEffect, useState } from 'react';
import { Card, Divider } from 'antd';
import { CardHeader } from '../common';
import { LocalStorageKeys } from '../../utils/localStorageKeys';
import { SaveManager } from '../SaveManager';
import { useAppSelector } from '../../lib/redux/hook';
import { selectEditingWorkItemEntity } from '../../lib/redux/feature/work-items/selectors';
import { GptFileTreeNode } from '../../types/common';

export function GptFilesExplorer() {
  // const { gptFileTree, toggleSelectedGptFiles } = useRootContext();
  const editingWorkItem = useAppSelector(selectEditingWorkItemEntity);
  const [filesForDownload, setFilesForDownload] = useState<GptFileTreeNode[]>(
    [],
  );

  useEffect(() => {
    if (editingWorkItem) {
      const { projectId } = editingWorkItem;
      const savedPath = localStorage.getItem(
        `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
      );
      // window.api.setProjectPath(savedPath);
    }
  }, [editingWorkItem]);

  const handleSelect = (selectedKeys: string[]) => {
    const selectedPath = selectedKeys[0];
    const findFile = (nodes: GptFileTreeNode[]): GptFileTreeNode | null => {
      for (const node of nodes) {
        if (node.path === selectedPath && node.type === 'file') {
          return node;
        }
        if (node.children) {
          const found = findFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    // const selectedFile = findFile(gptFileTree || []) || null;
    // toggleSelectedGptFiles(selectedFile);
  };

  const handleCheckboxChange = (file: GptFileTreeNode) => {
    setFilesForDownload((prev) =>
      prev.some((f) => f.path === file.path)
        ? prev.filter((f) => f.path !== file.path)
        : [...prev, file],
    );
  };

  // if (!gptFileTree?.length) {
  //   return (
  //     <Card className="gpt-files-explorer-card">
  //       <CardHeader title="GPT Files Explorer" />
  //       <Divider />
  //       <Empty
  //         image={Empty.PRESENTED_IMAGE_SIMPLE}
  //         description="No GPT Files Available"
  //       />
  //     </Card>
  //   );
  // }

  return (
    <Card className="gpt-files-explorer-card">
      <CardHeader title="GPT Files Explorer" />
      <Divider />
      <div className="gpt-files-explorer-content">
        {/* <GptFileTree */}
        {/*  treeData={gptFileTree} */}
        {/*  selectedKeys={[]} */}
        {/*  onSelectionChange={handleSelect} */}
        {/*  onCheckboxChange={handleCheckboxChange} */}
        {/* /> */}
        <Divider />
        <SaveManager files={filesForDownload} />
      </div>
    </Card>
  );
}
