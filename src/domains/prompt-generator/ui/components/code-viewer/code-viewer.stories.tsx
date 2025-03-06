import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import CodeViewer, { CodeViewerProps } from './';

export default {
  title: 'Components/CodeViewer',
  component: CodeViewer,
  argTypes: {
    code: { control: 'text' },
    originalCode: { control: 'text' },
    modifiedCode: { control: 'text' },
    language: { control: 'text' },
  },
} as Meta;

const Template: StoryFn<CodeViewerProps> = (args) => <CodeViewer {...args} />;

export const SingleCodeView = Template.bind({});
SingleCodeView.args = {
  code: `// Example: Single code snippet view
function greet() {
  console.log("Hello, world!");
}

greet();`,
  language: 'javascript',
};

export const DiffViewJavaScript = Template.bind({});
DiffViewJavaScript.args = {
  originalCode: `// Original code snippet
function greet() {
  console.log("Hello, world!");
}

greet();`,
  modifiedCode: `// Modified code snippet
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("Alice");`,
  language: 'javascript',
};

export const DiffViewTypeScript = Template.bind({});
DiffViewTypeScript.args = {
  originalCode: `// Original TypeScript snippet
function greet(): void {
  console.log("Hello, world!");
}

greet();`,
  modifiedCode: `// Modified TypeScript snippet
function greet(name: string): void {
  console.log("Hello, " + name + "!");
}

greet("Alice");`,
  language: 'typescript',
};
