export interface GptFileTreeNode {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'directory';
  children?: GptFileTreeNode[];
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: FileTreeNode[];
}
