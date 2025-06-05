import type { WorkItemType } from '../../../../domains/work-item/model/types';
import type { TextBlockType } from '../text-blocks/types';

export interface FileType {
  content: string;
  deleted?: boolean;
}

export interface ArtifactIteration {
  id: string;
  prompt: string;
  files: Record<string, FileType>;
  personalities?: Array<TextBlockType>;
}

export interface ArtifactType {
  _id: string;
  iterations: ArtifactIteration[];
  completed: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface ArtifactState {
  result: ArtifactType | null;
  latestFiles: Record<string, FileType> | null;
  selectedIterationId: string | null;
  loading: boolean;
  error: string | null;
}

export interface AddIterationArgs {
  orgSlug: string;
  projectId: string;
  workItemId: string;
  artifactIterationId?: string;
  provider: string;
  artifactId?: string;
  prompt?: string;
  personalityIds?: string[];
}

export type ResultGenerationType = {
  artifact: ArtifactType;
  workItem: WorkItemType;
};

export interface GenerationType {
  result: ResultGenerationType;
  status: {
    success: boolean;
    code: number;
  };
}
