export interface GptFileTreeNode {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'directory';
  children?: GptFileTreeNode[];
}
