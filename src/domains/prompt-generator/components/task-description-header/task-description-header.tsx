import React from 'react';
import { TaskDescription } from '..';
import styles from '../../ui/task-description.module.scss';

interface TaskDescriptionHeaderProps {
  codeGenExists: boolean;
}

export const TaskDescriptionHeader = React.forwardRef<
  any,
  TaskDescriptionHeaderProps
>(({ codeGenExists }, ref) => {
  return (
    <div
      className={styles.reservedTaskDescTop}
      style={{
        visibility: codeGenExists ? 'visible' : 'hidden',
      }}
    >
      <TaskDescription
        ref={ref}
        mode="small"
        preview
        style={{
          width: '100%',
        }}
      />
    </div>
  );
});
