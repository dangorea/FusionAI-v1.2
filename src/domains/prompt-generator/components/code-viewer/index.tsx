import React from 'react';
import DiffViewer from './diff-viewer';
import SingleCodeViewer from './singe-code-viewer';

export interface CodeViewerProps {
  code?: string;
  originalCode?: string;
  modifiedCode?: string;
  language?: string;
}

export function CodeViewer({
  code,
  originalCode,
  modifiedCode,
  language = 'typescript',
}: CodeViewerProps) {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  };

  // If both original and modified code are provided, use the diff viewer.
  if (originalCode !== undefined && modifiedCode !== undefined) {
    return (
      <div style={containerStyle}>
        <DiffViewer
          originalCode={originalCode}
          modifiedCode={modifiedCode}
          language={language}
        />
      </div>
    );
  }

  // Otherwise, use SingleCodeViewer to show a single file's code.
  if (code) {
    return (
      <div style={containerStyle}>
        <SingleCodeViewer code={code} language={language} />
      </div>
    );
  }

  return null;
}
