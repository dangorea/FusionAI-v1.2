export interface WorkItemType {
  id: string;
  orgId: string;
  projectId: string;
  name: string;
  contextId: string;
  codeGenerationId?: string;
  description: string;
}
