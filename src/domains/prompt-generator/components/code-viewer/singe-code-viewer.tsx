import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

export interface SingleCodeViewerProps {
  code: string;
  language?: string;
}

export function SingleCodeViewer({
  code,
  language = 'typescript',
}: SingleCodeViewerProps) {
  // Split the code into lines using a regex that handles both Windows and Unix line endings.
  const lines = code.split(/\r?\n/);

  // Base styling for the code cell, mimicking DiffViewer's look.
  const baseCodeCellStyle: React.CSSProperties = {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    padding: '2px 4px',
    whiteSpace: 'pre',
    overflow: 'hidden',
    margin: 0,
  };

  // Style for the line numbers column.
  const lineNumberCellStyle: React.CSSProperties = {
    width: '50px',
    textAlign: 'right',
    paddingRight: '8px',
    color: '#858585',
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    background: '#1e1e1e',
    lineHeight: '1.5',
    verticalAlign: 'middle',
    margin: 0,
  };

  // Code cell style (inherits from base style).
  const codeCellStyle: React.CSSProperties = {
    ...baseCodeCellStyle,
    backgroundColor: 'transparent',
  };

  // Container style: grid with two columns.
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    background: '#1e1e1e',
    color: '#d4d4d4',
    overflow: 'auto',
    width: '100%',
    height: '100%',
  };

  // Use a ref to measure the container height.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    }

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Assume a fixed row height (adjust if needed)
  const rowHeight = 24;
  const extraRows = Math.max(
    0,
    Math.floor(containerHeight / rowHeight) - lines.length,
  );

  let lineNumber = 1;

  return (
    <div style={containerStyle} ref={containerRef}>
      {lines.map((line, index) => {
        const grammar = Prism.languages[language] || Prism.languages.javascript;
        const highlighted = Prism.highlight(line, grammar, language);
        const currentNumber = lineNumber++;
        return (
          <React.Fragment key={index}>
            <div style={lineNumberCellStyle}>{currentNumber}</div>
            <div style={codeCellStyle}>
              <code
                dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }}
              />
            </div>
          </React.Fragment>
        );
      })}
      {Array.from({ length: extraRows }).map((_, i) => (
        <React.Fragment key={`filler-${i}`}>
          <div style={lineNumberCellStyle}>&nbsp;</div>
          <div style={baseCodeCellStyle}>
            <code>&nbsp;</code>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default SingleCodeViewer;
