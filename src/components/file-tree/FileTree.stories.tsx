import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import FileTree from './FileTree';

export default {
  title: 'Components/FileTree',
  component: FileTree,
  argTypes: {
    rootPath: { control: 'text' },
  },
} as Meta;

const Template: StoryFn<{
  rootPath: string;
}> = (args: { rootPath: string }) => {
  const [multipleFiles, setMultipleFiles] = useState<string>('');
  const [singleFile, setSingleFile] = useState<string>('');

  const handleMultipleSelect = (
    files: { filePath: string; content: string }[],
  ) => {
    setMultipleFiles(JSON.stringify(files, null, 2));
  };

  const handleSingleSelect = (file: { filePath: string; content: string }) => {
    setSingleFile(JSON.stringify(file, null, 2));
  };

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ width: 400 }}>
        <FileTree
          rootPath={args.rootPath}
          onMultipleSelect={handleMultipleSelect}
          onSingleSelect={handleSingleSelect}
        />
      </div>
      <div style={{ flex: 1 }}>
        <h3>Multiple Files Selected</h3>
        <pre>{multipleFiles}</pre>
        <h3>Single File Preview</h3>
        <pre>{singleFile}</pre>
      </div>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  rootPath: '/Users/dgorea/work',
};
