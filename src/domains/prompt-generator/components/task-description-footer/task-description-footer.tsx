import type { Ref } from 'react';
import React from 'react';
import {
  TaskDescription,
  type TaskDescriptionInputRef,
} from '../task-description';
import styles from '../../ui/task-description.module.scss';
import type { DropdownRef } from '../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectDefaultProvider,
  selectProviders,
  selectSelectedProviderEntity,
} from '../../../../lib/redux/feature/config/selectors';
import { setSelectedProvider } from '../../../../lib/redux/feature/config/reducer';
import type { DropdownOption } from '../../../../components/dropdown/dropdown';

interface TaskDescriptionFooterProps {
  codeGenExists: boolean;
  dropdownProviderRef: Ref<DropdownRef>;
  personalityDropdownRef?: Ref<DropdownRef>;
  handleSend: () => void;
  updateWorkItemDebounced: (value: string) => void;
  disableSend: boolean;
  personalities?: DropdownOption[];
  onImagesButtonClick?: () => void;
  personalityDefaultDropDownValue?: string | string[];
}

export const TaskDescriptionFooter = React.forwardRef<
  TaskDescriptionInputRef | null,
  TaskDescriptionFooterProps
>(
  (
    {
      codeGenExists,
      handleSend,
      updateWorkItemDebounced,
      dropdownProviderRef,
      personalityDropdownRef,
      disableSend,
      personalities,
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

    const defaultDropdownValue =
      selectedProvider?.id ||
      (defaultProvider ? defaultProvider.id : '') ||
      (providers.length > 0 ? providers[0].value : '');

    return (
      <div className={styles.reservedTaskDescBottom}>
        <TaskDescription
          ref={ref}
          dropdownProviderRef={dropdownProviderRef}
          personalityDropdownRef={personalityDropdownRef}
          personalityDefaultDropDownValue={personalityDefaultDropDownValue}
          onSend={handleSend}
          mode="small"
          dropdownOptions={providers}
          defaultDropdownValue={defaultDropdownValue}
          disableSend={disableSend}
          onDropdownProviderChange={handleProviderChange}
          personalityOptions={personalities}
          onContentChange={(value) => {
            updateWorkItemDebounced(value);
          }}
          onImagesButtonClick={onImagesButtonClick}
          style={{
            visibility: codeGenExists ? 'visible' : 'hidden',
            width: '100%',
            border: '1px solid #D8DBF4',
          }}
        />
      </div>
    );
  },
);
