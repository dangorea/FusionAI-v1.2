import React from 'react';
import type { Meta } from '@storybook/react';
import type { CodeViewerProps } from '../../domains/prompt-generator/components';
import { CodeViewer } from '../../domains/prompt-generator/components';

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

export function SingleCodeView(args: CodeViewerProps) {
  return <CodeViewer {...args} />;
}

SingleCodeView.args = {
  code: `// Example: Single code snippet view
function greet() {
  console.log("Hello, world!");
}

greet();`,
  language: 'javascript',
};

export function DiffViewJavaScript(args: CodeViewerProps) {
  return <CodeViewer {...args} />;
}

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

export function DiffViewTypeScript(args: CodeViewerProps) {
  return <CodeViewer {...args} />;
}

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
