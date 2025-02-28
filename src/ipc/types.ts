export interface SelectDirectoryResult {
  canceled: boolean;
  directoryPath: string;
  fileTree: FileTreeNode;
}

export interface GetFilesContentsResult {
  contents: FileContent[];
}

export interface PasteFromClipboardResult {
  content: string;
}

export interface ExecuteShellScriptResult {
  success: boolean;
  error?: string;
  stdout: string;
  stderr: string;
}

export interface FileContent {
  path: string;
  content: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: FileTreeNode[];
}

export interface SaveFilePayload {
  path: string;
  content: string;
}
