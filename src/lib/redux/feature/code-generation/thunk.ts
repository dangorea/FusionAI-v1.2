import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CodeGenerationIteration, CodeGenerationResult } from './types';
import {
  addIterationAPI,
  getCodeGenerationSession,
} from '../../../../api/code-generations';

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

export const addIterationThunk = createAsyncThunk<
  {
    newIteration: CodeGenerationIteration;
    latestFiles: Record<string, string>;
  },
  {
    id: string;
    prompt: string;
    startFromIterationId: string;
  },
  { rejectValue: string }
>(
  'codeGeneration/addIteration',
  async ({ id, prompt, startFromIterationId }, { rejectWithValue }) => {
    try {
      const response = await addIterationAPI(id, {
        prompt,
        startFromIterationId,
      });
      if (!response) {
        return rejectWithValue('Failed to add iteration');
      }

      const latestIteration =
        response.iterations[response.iterations.length - 1];
      return {
        newIteration: latestIteration,
        latestFiles: latestIteration.files,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
