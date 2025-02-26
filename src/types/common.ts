export interface SourceFile {
  path: string;
  content?: string;
}

export interface TextBlock {
  title: string;
  details: string;
  id: string;
}

export interface NewWorkItem {
  name: string;
}

export interface WorkItem {
  id: string;
  orgId?: string;
  projectId?: string;
  name: string;
  description: string;
  taskDescription?: string; // Optional field, not always provided
  sourceFiles: SourceFile[]; // Array of SourceFile objects
  textBlocks: TextBlock[]; // Array of TextBlock objects
  compiledMessage?: string; // Optional field for compiled message
}
