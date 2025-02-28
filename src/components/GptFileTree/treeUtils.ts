import { GptFileTreeNode } from '../../state/types';

export const transformToGptFileTree = (
  files: Record<string, string>,
): GptFileTreeNode[] => {
  const root: GptFileTreeNode = {
    name: 'Root',
    path: '/',
    type: 'directory',
    children: [],
  };

  Object.entries(files).forEach(([path, content]) => {
    const parts = path.split(/[/\\]/).filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let child = current.children?.find((child) => child.name === part);

      if (child) {
        if (!isFile) {
          current = child;
        }
        return;
      }

      child = {
        name: part,
        path: `${current.path === '/' ? '' : current.path}/${part}`,
        type: isFile ? 'file' : 'directory',
        content: isFile ? content : undefined,
        children: isFile ? undefined : [],
      };

      current.children?.push(child);

      if (!isFile) {
        current = child;
      }
    });
  });

  return root.children || [];
};
