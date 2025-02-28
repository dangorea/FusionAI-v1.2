import { FileTreeNode } from '../../ipc/types';

export function fileTreeNodeToPathArray(node: FileTreeNode): string[] {
  return node.children.reduce(
    (files, file) => {
      if (file.type === 'file') {
        files.push(file.path);
      } else {
        files.push(...fileTreeNodeToPathArray(file));
      }

      files.push();

      return files;
    },
    [node.path],
  );
}
