export interface SourceFileType {
  path: string;
  content?: string;
}

export interface TextBlockType {
  title: string;
  details: string;
  id: string;
}

export interface WorkItemType {
  id: string;
  orgId: string;
  projectId: string;
  name: string;
  description: string;
  taskDescription?: string;
  sourceFiles: SourceFileType[];
  textBlocks: TextBlockType[];
  codeGenerationId?: string;
}
