import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

export interface SingleViewerStyleOverrides {
  container?: React.CSSProperties;
  lineNumber?: React.CSSProperties;
  baseCodeCell?: React.CSSProperties;
}

export interface SingleCodeViewerProps {
  code: string;
  language?: string;
  styleOverrides?: SingleViewerStyleOverrides;
}

function SingleCodeViewer({
  code,
  language = 'typescript',
  styleOverrides = {},
}: SingleCodeViewerProps) {
  const lines = code.split(/\r?\n/);

  const defaultBaseCodeCellStyle: React.CSSProperties = {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    padding: '2px 4px',
    whiteSpace: 'pre',
    // Removed overflow: 'hidden' to allow horizontal scrolling
    margin: 0,
  };
  const baseCodeCellStyle: React.CSSProperties = {
    ...defaultBaseCodeCellStyle,
    ...styleOverrides.baseCodeCell,
  };

  const defaultLineNumberCellStyle: React.CSSProperties = {
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
  const lineNumberCellStyle: React.CSSProperties = {
    ...defaultLineNumberCellStyle,
    ...styleOverrides.lineNumber,
  };

  const defaultContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    background: '#1e1e1e',
    color: '#d4d4d4',
    overflow: 'auto',
    width: '100%',
    height: '100%',
  };
  const containerStyle: React.CSSProperties = {
    ...defaultContainerStyle,
    ...styleOverrides.container,
  };

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

  const rowHeight = 24;
  const extraRows = Math.max(
    0,
    Math.floor(containerHeight / rowHeight) - lines.length,
  );

  const highlight = (text: string) => {
    const grammar = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(text, grammar, language);
  };

  let lineNumber = 1;

  return (
    <div style={containerStyle} ref={containerRef}>
      {lines.map((line, index) => {
        const highlighted = highlight(line);
        const currentNumber = lineNumber++;
        return (
          <React.Fragment key={index}>
            <div style={lineNumberCellStyle}>{currentNumber}</div>
            <div style={baseCodeCellStyle}>
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
