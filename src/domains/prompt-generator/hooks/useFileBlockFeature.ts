import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { notification } from 'antd';

import type { TaskDescriptionInputRef } from '../components';
import { updateTaskDescriptionWithFileBlocks } from '../utils/file-block';

interface UseFileBlockFeatureParams {
  bigTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  selectedFiles: Record<string, string>;
}

interface UseFileBlockFeatureReturn {
  isFileBlockFeatureEnabled: boolean;
  setIsFileBlockFeatureEnabled: Dispatch<SetStateAction<boolean>>;
}

export function useFileBlockFeature(
  params: UseFileBlockFeatureParams,
): UseFileBlockFeatureReturn {
  const { bigTaskDescRef, selectedFiles } = params;

  const [isFileBlockFeatureEnabled, setIsFileBlockFeatureEnabled] = useState(
    localStorage.getItem('fileBlockFeatureEnabled') === 'true',
  );

  const featureEnabledRef = useRef(isFileBlockFeatureEnabled);

  useEffect(() => {
    featureEnabledRef.current = isFileBlockFeatureEnabled;
  }, [isFileBlockFeatureEnabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey) return;

      if (event.key.toLowerCase() === 'x') {
        if (!featureEnabledRef.current) {
          setIsFileBlockFeatureEnabled(true);
          notification.info({
            message: 'Feature Enabled Temporarily',
            description:
              'The file block modification feature is now enabled temporarily.',
          });
        }
      }

      if (event.key.toLowerCase() === 'm') {
        if (!featureEnabledRef.current) {
          setIsFileBlockFeatureEnabled(true);
          localStorage.setItem('fileBlockFeatureEnabled', 'true');
          notification.info({
            message: 'Feature Permanently Enabled',
            description:
              'The file block modification feature is now permanently enabled.',
          });
        } else {
          setIsFileBlockFeatureEnabled(false);
          localStorage.removeItem('fileBlockFeatureEnabled');
          notification.info({
            message: 'Feature Disabled',
            description: 'The file block modification feature is now disabled.',
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isFileBlockFeatureEnabled) return;
    if (!bigTaskDescRef.current) return;

    updateTaskDescriptionWithFileBlocks(
      {
        getContent: () => bigTaskDescRef.current?.getContent() ?? '',
        setContent: (valOrFn) => {
          if (!bigTaskDescRef.current) return;
          if (typeof valOrFn === 'function') {
            const oldVal = bigTaskDescRef.current.getContent();
            const newVal = valOrFn(oldVal);
            bigTaskDescRef.current.setContent(newVal);
          } else {
            bigTaskDescRef.current.setContent(valOrFn);
          }
        },
      },
      selectedFiles,
    );
  }, [selectedFiles, isFileBlockFeatureEnabled, bigTaskDescRef]);

  return {
    isFileBlockFeatureEnabled,
    setIsFileBlockFeatureEnabled,
  };
}
