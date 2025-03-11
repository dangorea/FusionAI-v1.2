import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DiffViewer from './diff-viewer';

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
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle: React.CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    overflow: 'auto',
  };

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

  if (code) {
    return (
      <div style={containerStyle}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return null;
}
