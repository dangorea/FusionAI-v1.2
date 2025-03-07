import React, { useRef } from 'react';
import type { Meta } from '@storybook/react';
import type { TaskDescriptionInputRef } from '../../domains/prompt-generator/components';
import { TaskDescription } from '../../domains/prompt-generator/components';

export default {
  title: 'Components/TaskDescriptionInput',
  component: TaskDescription,
} as Meta;

export function Default(args: any) {
  const ref = useRef<TaskDescriptionInputRef>(null);

  function handleSend(content: string) {
    alert(`User clicked Send.\nContent:\n\n${content}`);
  }

  function handleAddFileBlock() {
    if (ref.current) {
      ref.current.addExtraContent(
        '\n\n=== File: sample.ts ===\nconsole.log("Hello World");\n=== EndFile: sample.ts ===\n\n',
      );
    }
  }

  function handleClearAll() {
    if (ref.current) {
      ref.current.setContent('');
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <TaskDescription ref={ref} onSend={handleSend} {...args} />
      <div style={{ marginTop: '1rem' }}>
        <button type="button" onClick={handleAddFileBlock}>
          Add File Block
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          style={{ marginLeft: '1rem' }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

Default.args = {};
