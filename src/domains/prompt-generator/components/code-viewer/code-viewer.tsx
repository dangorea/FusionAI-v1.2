import React from 'react';
import type { DiffViewerStyleOverrides } from './diff-viewer';
import DiffViewer from './diff-viewer';
import type { SingleViewerStyleOverrides } from './singe-code-viewer';
import SingleCodeViewer from './singe-code-viewer';

export interface CodeViewerProps {
  code?: string;
  originalCode?: string;
  modifiedCode?: string;
  language?: string;
  diffViewerStyleOverrides?: DiffViewerStyleOverrides;
  singleViewerStyleOverrides?: SingleViewerStyleOverrides;
}

export function CodeViewer({
  code,
  originalCode,
  modifiedCode,
  language = 'typescript',
  diffViewerStyleOverrides,
  singleViewerStyleOverrides,
}: CodeViewerProps) {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
  };

  if (originalCode !== undefined && modifiedCode !== undefined) {
    return (
      <div style={containerStyle}>
        <DiffViewer
          originalCode={originalCode}
          modifiedCode={modifiedCode}
          language={language}
          styleOverrides={diffViewerStyleOverrides}
        />
      </div>
    );
  }

  if (code) {
    return (
      <div style={containerStyle}>
        <SingleCodeViewer
          code={code}
          language={language}
          styleOverrides={singleViewerStyleOverrides}
        />
      </div>
    );
  }

  return <>No code found</>;
}
