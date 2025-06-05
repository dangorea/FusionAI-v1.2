import React, { type Ref } from 'react';
import {
  TaskDescription,
  type TaskDescriptionInputRef,
} from '../task-description';
import styles from '../../ui/task-description.module.scss';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectDefaultProvider,
  selectProviders,
  selectSelectedProviderEntity,
} from '../../../../lib/redux/feature/config/selectors';
import { setSelectedProvider } from '../../../../lib/redux/feature/config/reducer';
import type { DropdownRef } from '../../../../components';
import type { DropdownOption } from '../../../../components/dropdown/dropdown';

interface TaskDescriptionHeaderProps {
  codeGenExists: boolean;
  preview: boolean;
  disableSend: boolean;
  dropdownProviderRef: Ref<DropdownRef>;
  personalityDropdownRef: Ref<DropdownRef>;
  personalities?: DropdownOption[];
  handleSend: () => void;
  updateWorkItemDebounced: (value: string) => void;
  onEdit?: () => void;
  onMount?: (api: TaskDescriptionInputRef) => void;
  onImagesButtonClick?: () => void;
  personalityDefaultDropDownValue?: string | string[];
}

export const TaskDescriptionHeader = React.forwardRef<
  TaskDescriptionInputRef | null,
  TaskDescriptionHeaderProps
>(
  (
    {
      codeGenExists,
      preview,
      onEdit,
      onMount,
      updateWorkItemDebounced,
      dropdownProviderRef,
      personalityDropdownRef,
      personalities,
      disableSend,
      handleSend,
      onImagesButtonClick,
      personalityDefaultDropDownValue,
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const providers = useAppSelector(selectProviders).map((provider) => ({
      label: provider.name,
      value: provider.id,
    }));
    const selectedProvider = useAppSelector(selectSelectedProviderEntity);
    const defaultProvider = useAppSelector(selectDefaultProvider);

    const handleProviderChange = (value: string | string[]) => {
      dispatch(setSelectedProvider(value as string));
    };

    if (!codeGenExists) {
      return null;
    }

    const defaultDropdownValue =
      selectedProvider?.id ||
      (defaultProvider ? defaultProvider.id : '') ||
      (providers.length > 0 ? providers[0].value : '');

    return (
      <div
        className={styles.reservedTaskDescTop}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TaskDescription
          ref={ref}
          dropdownProviderRef={dropdownProviderRef}
          personalityDropdownRef={personalityDropdownRef}
          personalityOptions={personalities}
          onSend={handleSend}
          mode="small"
          preview={preview}
          style={{ width: '100%' }}
          onEdit={onEdit}
          onMount={onMount}
          dropdownOptions={providers}
          defaultDropdownValue={defaultDropdownValue}
          disableSend={disableSend}
          onDropdownProviderChange={handleProviderChange}
          onContentChange={updateWorkItemDebounced}
          onImagesButtonClick={onImagesButtonClick}
          personalityDefaultDropDownValue={personalityDefaultDropDownValue}
        />
      </div>
    );
  },
);
