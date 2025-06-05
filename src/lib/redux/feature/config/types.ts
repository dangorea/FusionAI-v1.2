import type { LLMProvider } from '../../../../types/common';

type Provider = {
  options: LLMProvider[];
  selectedProvider: string | null;
};

export interface ConfigState {
  provider: Provider;
}

export interface LoadProvidersParams {
  orgSlug: string;
  projectId: string;
}

