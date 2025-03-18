import type { Ref } from 'react';
import React from 'react';
import { TaskDescription } from '..';
import styles from '../../ui/task-description.module.scss';
import type { DropdownRef } from '../../../../components';

interface TaskDescriptionFooterProps {
  codeGenExists: boolean;
  dropdownRef: Ref<DropdownRef>;
  handleSend: () => void;
  updateWorkItemDebounced: () => void;
}

export const TaskDescriptionFooter = React.forwardRef<
  any,
  TaskDescriptionFooterProps
>(
  (
    { codeGenExists, handleSend, updateWorkItemDebounced, dropdownRef },
    ref,
  ) => {
    return (
      <div className={styles.reservedTaskDescBottom}>
        <TaskDescription
          ref={ref}
          dropdownRef={dropdownRef}
          onSend={handleSend}
          mode="small"
          onContentChange={() => {
            updateWorkItemDebounced();
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
