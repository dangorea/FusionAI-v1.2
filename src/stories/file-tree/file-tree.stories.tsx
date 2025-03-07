import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta } from '@storybook/react';
import { FileOutlined, FolderFilled } from '@ant-design/icons';
import { FileTree } from '../../components';

export default {
  title: 'Components/FileTree',
  component: FileTree,
  argTypes: {
    rootPath: { control: 'text' },
  },
} as Meta;

export function Default(args: { rootPath: string }): ReactElement {
  const { rootPath } = args;
  const [multipleFiles, setMultipleFiles] = useState('');
  const [singleFile, setSingleFile] = useState('');

  function handleMultipleSelect(files: string[]): void {
    setMultipleFiles(JSON.stringify(files, null, 2));
  }

  function handleSingleSelect(filePath: string): void {
    if (!filePath) {
      setSingleFile('');
    } else {
      setSingleFile(JSON.stringify(filePath, null, 2));
    }
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ width: 400 }}>
        <FileTree
          rootPath={rootPath}
          onFileSelectionChange={handleMultipleSelect}
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
}

Default.args = {
  rootPath: '/Users/YourName/projects/example',
};

export function WithFileSets(): ReactElement {
  const [multipleFiles, setMultipleFiles] = useState('');
  const [singleFile, setSingleFile] = useState('');

  function handleMultipleSelect(files: string[]): void {
    setMultipleFiles(JSON.stringify(files, null, 2));
  }

  function handleSingleSelect(filePath: string): void {
    if (!filePath) {
      setSingleFile('');
    } else {
      setSingleFile(JSON.stringify(filePath, null, 2));
    }
  }

  const fileSets = [
    {
      id: 'source-files',
      name: 'Source Files',
      visible: true,
      tree: {
        name: 'src',
        path: '/src',
        children: [
          { name: 'index.tsx', path: '/src/index.tsx' },
          { name: 'App.tsx', path: '/src/App.tsx' },
          {
            name: 'components',
            path: '/src/components',
            children: [
              { name: 'Header.tsx', path: '/src/components/Header.tsx' },
              { name: 'Footer.tsx', path: '/src/components/Footer.tsx' },
            ],
          },
        ],
      },
      style: {
        folderIcon: <FolderFilled />,
        fileIcon: <FileOutlined />,
      },
    },
    {
      id: 'assets',
      name: 'Assets',
      visible: true,
      tree: {
        name: 'assets',
        path: '/assets',
        children: [
          {
            name: 'images',
            path: '/assets/images',
            children: [
              { name: 'logo.png', path: '/assets/images/logo.png' },
              { name: 'background.jpg', path: '/assets/images/background.jpg' },
            ],
          },
          {
            name: 'styles',
            path: '/assets/styles',
            children: [{ name: 'main.css', path: '/assets/styles/main.css' }],
          },
        ],
      },
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ width: 400 }}>
        <FileTree
          fileSets={fileSets}
          onFileSelectionChange={handleMultipleSelect}
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
}
