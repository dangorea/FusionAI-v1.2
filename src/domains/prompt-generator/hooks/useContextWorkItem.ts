import type { Dispatch, Key, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { notification } from 'antd';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import type { DebouncedFunc, DebouncedFuncLeading } from 'lodash';

import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { selectSelectedWorkItemEntity } from '../../../lib/redux/feature/work-items/selectors';
import {
  fetchContextThunk,
  updateContextThunk,
} from '../../../lib/redux/feature/context/thunk';
import { selectContext } from '../../../lib/redux/feature/context/selectors';
import { LocalStorageKeys } from '../../../utils/localStorageKeys';
import { clearArtifact } from '../../../lib/redux/feature/artifacts/reducer';
import { fetchCodeArtifactById } from '../../../lib/redux/feature/artifacts/thunk';
import {
  getAbsoluteFilePath,
  getCheckedPaths,
  getRelativePath,
} from '../utils/path';
import { clearContext } from '../../../lib/redux/feature/context/reducer';

export interface UseContextWorkItemReturn {
  orgSlug?: string;
  isLoading: boolean;
  hasUserModifiedContext: boolean;
  setHasUserModifiedContext: Dispatch<SetStateAction<boolean>>;

  projectPath: string;
  setProjectPath: Dispatch<SetStateAction<string>>;
  selectedFiles: Record<string, string>;
  setSelectedFiles: Dispatch<SetStateAction<Record<string, string>>>;
  onRulesSelected: (newRuleIds: string[]) => void;
  selectedRules: string[];
  setSelectedRules: Dispatch<SetStateAction<string[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setUserIsEditingContext: Dispatch<SetStateAction<boolean>>;

  defaultCheckedKeys: Key[];

  updateContextDebounced:
    | DebouncedFuncLeading<() => Promise<void>>
    | DebouncedFunc<() => Promise<void>>;
}

export function useContextWorkItem(): UseContextWorkItemReturn {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const orgSlug = org?.slug;
  const projectId = useAppSelector(selectSelectedProjectId);
  const workItem = useAppSelector(selectSelectedWorkItemEntity);
  const context = useAppSelector(selectContext);

  const [isLoading, setIsLoading] = useState(false);
  const [projectPath, setProjectPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {},
  );
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [hasUserModifiedContext, setHasUserModifiedContext] = useState(false);

  const [defaultCheckedKeys, setDefaultCheckedKeys] = useState<Key[]>([]);

  const [userIsEditingContext, setUserIsEditingContext] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const savedPath = localStorage.getItem(
      `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
    );
    if (savedPath) {
      setProjectPath(savedPath);
    }
  }, [projectId]);

  useEffect(() => {
    dispatch(clearContext());
    setSelectedFiles({});
    setDefaultCheckedKeys([]);
    setSelectedRules([]);
    dispatch(clearArtifact());
    if (orgSlug && workItem?.contextId && projectId) {
      setIsLoading(true);
      dispatch(
        fetchContextThunk({
          contextId: workItem.contextId,
          orgSlug,
          projectId,
        }),
      )
        .finally(() => setIsLoading(false))
        .catch(console.error);
    }
  }, [workItem?.contextId, dispatch]);

  useEffect(() => {
    dispatch(clearArtifact());
    if (workItem?.codeGenerationId) {
      setIsLoading(true);
      dispatch(fetchCodeArtifactById(workItem.codeGenerationId))
        .finally(() => setIsLoading(false))
        .catch(console.error);
    }
  }, [workItem?.codeGenerationId, dispatch]);

  useEffect(() => {
    async function loadSourceFiles() {
      if (
        context?.sourceFiles &&
        projectPath &&
        Object.keys(selectedFiles).length === 0 &&
        !userIsEditingContext &&
        !updateInProgress
      ) {
        try {
          const filePaths = context.sourceFiles.map((sf) =>
            getAbsoluteFilePath(sf.path, projectPath),
          );
          const filesContent = await Promise.all(
            filePaths.map(async (fp) => {
              const content = await window.fileAPI.readFileContent(fp);
              return { fp, content };
            }),
          );
          const newSelected: Record<string, string> = {};
          filesContent.forEach(({ fp, content }) => {
            newSelected[fp] = content;
          });
          setSelectedFiles(newSelected);
        } catch (err) {
          console.error('Error loading context source files:', err);
        }
      }

      if (
        context?.textBlocks &&
        selectedRules.length === 0 &&
        !userIsEditingContext &&
        !updateInProgress
      ) {
        const newRuleIds = context.textBlocks.map((tb) => tb.id);
        if (newRuleIds.length > 0) {
          setSelectedRules(newRuleIds);
        }
      }
    }

    loadSourceFiles();
  }, [
    context?.sourceFiles,
    context?.textBlocks,
    projectPath,
    userIsEditingContext,
    updateInProgress,
  ]);

  useEffect(() => {
    if (context?.sourceFiles && projectPath) {
      const checkedPaths = getCheckedPaths(context.sourceFiles, projectPath);
      setDefaultCheckedKeys(checkedPaths);
    }
  }, [context?.sourceFiles, projectPath]);

  const updateContextDebounced = useCallback(
    debounce(async () => {
      if (!context?.id || !projectId || !orgSlug) {
        setHasUserModifiedContext(false);
        return;
      }

      setUpdateInProgress(true);

      // Compute source files directly inside the callback (no useMemo here)
      const computedSourceFiles = Object.entries(selectedFiles).map(
        ([absPath, content]) => ({
          path: getRelativePath(absPath, projectPath),
          content,
        }),
      );

      const sortFiles = (arr: { path: string; content: string }[]) =>
        [...arr].sort((a, b) => a.path.localeCompare(b.path));

      const oldSorted = sortFiles(context.sourceFiles ?? []);
      const newSorted = sortFiles(computedSourceFiles);

      const filesChanged = !isEqual(newSorted, oldSorted);

      const storeRuleIds = (context.textBlocks ?? []).map((tb) => tb.id).sort();
      const localRuleIds = [...selectedRules].sort();
      const rulesChanged = !isEqual(storeRuleIds, localRuleIds);

      if (!filesChanged && !rulesChanged) {
        setHasUserModifiedContext(false);
        setUpdateInProgress(false);
        return;
      }

      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
      const controller = new AbortController();
      requestControllerRef.current = controller;

      try {
        // Combine update payload if both changed.
        const updateData: any = {};
        if (filesChanged) {
          updateData.sourceFiles = computedSourceFiles;
        }
        if (rulesChanged) {
          updateData.textBlockIds = selectedRules;
        }
        await dispatch(
          updateContextThunk({
            contextId: context.id,
            orgSlug,
            projectId,
            updateData,
            signal: controller.signal,
          }),
        );
        setHasUserModifiedContext(false);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          controller.abort();
        } else {
          console.error('Context update failed:', err);
          notification.error({
            message: 'Partial update failed',
            description: err.message,
          });
        }
      } finally {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
          setUpdateInProgress(false);
        }
      }
    }, 800),
    [projectId, context, selectedFiles, selectedRules, projectPath, dispatch],
  );

  useEffect(() => {
    if (hasUserModifiedContext) {
      updateContextDebounced();
    } else {
      updateContextDebounced.cancel();
    }
    return () => updateContextDebounced.cancel();
  }, [hasUserModifiedContext, selectedRules.length, updateContextDebounced]);

  useEffect(() => {
    const unsub = window.electron.ipcRenderer.on(
      'file-changed',
      (data: any) => {
        setUserIsEditingContext(true);
        setHasUserModifiedContext(true);

        setSelectedFiles((prev) => ({
          ...prev,
          [data.filePath]: data.content,
        }));

        notification.info({
          message: `File Updated`,
          description: `File changed: ${data.filePath}`,
        });
      },
    );
    return () => unsub();
  }, []);

  function onRulesSelected(newRuleIds: string[]) {
    setUserIsEditingContext(true);
    setHasUserModifiedContext(true);
    setSelectedRules(newRuleIds);
  }

  return {
    orgSlug,
    isLoading,
    hasUserModifiedContext,
    setHasUserModifiedContext,

    projectPath,
    setProjectPath,
    selectedFiles,
    setSelectedFiles,
    selectedRules,
    setSelectedRules,
    onRulesSelected,
    setIsLoading,

    defaultCheckedKeys,

    updateContextDebounced,
    setUserIsEditingContext,
  };
}
