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

export type IterationType = {
  prompt: string;
  files: Record<string, string>;
  timestamp: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export type CodeGenerationType = {
  _id: string;
  iterations: IterationType[];
  completed: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
};
