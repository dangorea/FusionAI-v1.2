import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AddIterationArgs, ArtifactType, GenerationType } from './types';
import { getCodeArtifactById } from '../../../../api/artifacts';
import { aiCoderExecute } from '../../../../api/ai-agents';

export const fetchCodeArtifactById = createAsyncThunk<
  ArtifactType,
  string,
  { rejectValue: string }
>('artifact/fetchArtifact', async (artifactId, { rejectWithValue }) => {
  try {
    const response: ArtifactType = await getCodeArtifactById(artifactId);
    if (!response) {
      return rejectWithValue('Failed to fetch code generation');
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const executeAICoder = createAsyncThunk<
  GenerationType,
  AddIterationArgs,
  { rejectValue: string }
>(
  'artifact/addIteration',
  async (
    {
      orgSlug,
      projectId,
      workItemId,
      artifactId,
      artifactIterationId,
      prompt,
      provider,
      personalityIds,
    },
    { rejectWithValue },
  ) => {
    try {
      const response: GenerationType = await aiCoderExecute(
        orgSlug,
        projectId,
        {
          workItemId,
          artifactId,
          artifactIterationId,
          prompt,
          provider,
          personalityIds,
        },
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
