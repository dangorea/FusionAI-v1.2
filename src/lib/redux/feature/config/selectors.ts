import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { LLMProvider } from '../../../../types/common';

/**
 * Selector to get the list of LLM providers from the config state.
 */
export const selectProviders = (state: RootState): LLMProvider[] =>
  state.config.provider.options;

/**
 * Selector to get the selected provider ID
 */
const selectSelectedProviderId = (state: RootState): string | null =>
  state.config.provider.selectedProvider;

/**
 * Selector to get the default provider from the options
 */
export const selectDefaultProvider = (
  state: RootState,
): LLMProvider | undefined =>
  state.config.provider.options.find((provider) => provider.default);

/**
 * Selector to get a specific provider by its ID.
 * @param providerId The unique identifier of the provider.
 */
export const selectProviderById =
  (providerId: string) =>
  (state: RootState): LLMProvider | undefined =>
    state.config.provider.options.find(
      (provider) => provider.id === providerId,
    );

/**
 * Returns the currently selected provider.
 */
export const selectSelectedProviderEntity = createSelector(
  [selectProviders, selectSelectedProviderId],
  (providers, currentId): LLMProvider | null =>
    providers.find((provider) => provider.id === currentId) ?? null,
);
