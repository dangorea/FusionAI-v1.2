import type { Ref } from 'react';
import React from 'react';
import { TaskDescription } from '../task-description';
import styles from '../../ui/task-description.module.scss';
import type { DropdownRef } from '../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectProviders,
  selectSelectedProviderEntity,
} from '../../../../lib/redux/feature/config/selectors';
import { setSelectedProvider } from '../../../../lib/redux/feature/config/reducer';

interface TaskDescriptionFooterProps {
  codeGenExists: boolean;
  dropdownRef: Ref<DropdownRef>;
  handleSend: () => void;
  updateWorkItemDebounced: (value: string) => void;
  disableSend: boolean;
}

export const TaskDescriptionFooter = React.forwardRef<
  any,
  TaskDescriptionFooterProps
>(
  (
    {
      codeGenExists,
      handleSend,
      updateWorkItemDebounced,
      dropdownRef,
      disableSend,
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const providers = useAppSelector(selectProviders).map((provider) => ({
      label: provider.name,
      value: provider.id,
    }));
    const selectedProvider = useAppSelector(selectSelectedProviderEntity);

    const handleProviderChange = (value: string | string[]) => {
      dispatch(setSelectedProvider(value as string));
    };

    return (
      <div className={styles.reservedTaskDescBottom}>
        <TaskDescription
          ref={ref}
          dropdownRef={dropdownRef}
          onSend={handleSend}
          mode="small"
          dropdownOptions={providers}
          defaultDropdownValue={selectedProvider?.id ?? providers[3].value}
          disableSend={disableSend}
          onDropdownChange={handleProviderChange}
          onContentChange={(value) => {
            updateWorkItemDebounced(value);
          }}
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
