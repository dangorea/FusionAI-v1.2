export interface CodeGenerationIteration {
  prompt: string;
  files: Record<string, string>;
  timestamp: string;
  _id: string;
}

export interface CodeGenerationResult {
  _id: string;
  iterations: CodeGenerationIteration[];
  completed: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface CodeGenerationState {
  result: CodeGenerationResult | null;
  latestFiles: Record<string, string> | null;
  loading: boolean;
  error: string | null;
}
