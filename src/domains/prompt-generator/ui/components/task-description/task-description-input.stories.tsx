import React, { useRef } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import TaskDescriptionInput, {
  TaskDescriptionInputRef,
} from './task-description-input';

export default {
  title: 'Components/TaskDescriptionInput',
  component: TaskDescriptionInput,
} as Meta;

const Template: StoryFn = (args) => {
  const ref = useRef<TaskDescriptionInputRef>(null);

  const handleSend = (content: string) => {
    alert(`User clicked Send.\nContent:\n\n${content}`);
  };

  const handleAddFileBlock = () => {
    if (ref.current) {
      ref.current.addExtraContent(
        '\n\n=== File: sample.ts ===\nconsole.log("Hello World");\n=== EndFile: sample.ts ===\n\n',
      );
    }
  };

  const handleClearAll = () => {
    if (ref.current) {
      ref.current.setContent('');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <TaskDescriptionInput ref={ref} onSend={handleSend} {...args} />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleAddFileBlock}>Add File Block</button>
        <button onClick={handleClearAll} style={{ marginLeft: '1rem' }}>
          Clear All
        </button>
      </div>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
