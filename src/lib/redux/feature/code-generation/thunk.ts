import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CodeGenerationResult } from './types';
import { getCodeGenerationSession } from '../../../../api/code-generations';

export const fetchCodeGeneration = createAsyncThunk<
  { result: CodeGenerationResult; latestFiles: Record<string, string> },
  string,
  { rejectValue: string }
>(
  'codeGeneration/fetchCodeGeneration',
  async (codeGenerationId, { rejectWithValue }) => {
    try {
      const response = await getCodeGenerationSession(codeGenerationId);
      if (!response) {
        return rejectWithValue('Failed to fetch code generation');
      }
      const latestIteration =
        response.iterations[response.iterations.length - 1];
      return { result: response, latestFiles: latestIteration.files };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
