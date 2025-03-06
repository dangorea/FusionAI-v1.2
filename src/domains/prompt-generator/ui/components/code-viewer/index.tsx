import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CustomSideBySideDiffViewer from './custom-diff-viewer';

export interface CodeViewerProps {
  /**
   * Single code snippet if diff is not needed.
   */
  code?: string;
  /**
   * Original code for diff.
   */
  originalCode?: string;
  /**
   * Modified code for diff.
   */
  modifiedCode?: string;
  /**
   * The language for syntax highlighting (e.g., "typescript", "javascript").
   */
  language?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  originalCode,
  modifiedCode,
  language = 'typescript',
}) => {
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

  if (originalCode && modifiedCode) {
    return (
      <div style={containerStyle}>
        <CustomSideBySideDiffViewer
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
};

export default CodeViewer;
