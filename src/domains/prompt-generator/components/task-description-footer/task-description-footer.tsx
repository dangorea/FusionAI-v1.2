import React from 'react';
import { TaskDescription } from '..';
import styles from '../../ui/task-description.module.scss';

interface TaskDescriptionFooterProps {
  codeGenExists: boolean;
  handleSend: () => void;
  updateWorkItemDebounced: () => void;
}

export const TaskDescriptionFooter = React.forwardRef<
  any,
  TaskDescriptionFooterProps
>(({ codeGenExists, handleSend, updateWorkItemDebounced }, ref) => {
  return (
    <div className={styles.reservedTaskDescBottom}>
      <TaskDescription
        ref={ref}
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
});
