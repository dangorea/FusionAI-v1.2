import React, { useEffect, useRef, useState } from 'react';
import { diffLines } from 'diff';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

export interface DiffViewerStyleOverrides {
  container?: React.CSSProperties;
  lineNumber?: React.CSSProperties;
  baseCodeCell?: React.CSSProperties;
  addedCodeCell?: React.CSSProperties;
  removedCodeCell?: React.CSSProperties;
  unchangedCodeCell?: React.CSSProperties;
}

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  styleOverrides?: DiffViewerStyleOverrides;
}

function DiffViewer({
  originalCode,
  modifiedCode,
  language = 'typescript',
  styleOverrides = {},
}: DiffViewerProps) {
  const highlightCode = (code: string) => {
    const grammar = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, language);
  };
  const isNewFile = !originalCode.trim();
  const diffParts = diffLines(originalCode, modifiedCode);

  const defaultBaseCodeCellStyle: React.CSSProperties = {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    padding: '2px 4px',
    whiteSpace: 'pre',
  };

  const baseCodeCellStyle: React.CSSProperties = {
    ...defaultBaseCodeCellStyle,
    ...styleOverrides.baseCodeCell,
  };

  const defaultContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isNewFile ? '50px 1fr' : '50px 1fr 50px 1fr',
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
  };
  const lineNumberCellStyle: React.CSSProperties = {
    ...defaultLineNumberCellStyle,
    ...styleOverrides.lineNumber,
  };

  const getAddedStyle = (): React.CSSProperties => ({
    ...baseCodeCellStyle,
    backgroundColor: '#294436',
    ...styleOverrides.addedCodeCell,
  });

  const getRemovedStyle = (): React.CSSProperties => ({
    ...baseCodeCellStyle,
    backgroundColor: '#3f2d2d',
    ...styleOverrides.removedCodeCell,
  });

  const getUnchangedStyle = (): React.CSSProperties => ({
    ...baseCodeCellStyle,
    backgroundColor: 'transparent',
    ...styleOverrides.unchangedCodeCell,
  });

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

  if (isNewFile) {
    const lines = modifiedCode.split('\n');
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    return (
      <div style={containerStyle} ref={containerRef}>
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            <div style={lineNumberCellStyle}>{index + 1}</div>
            <div style={getAddedStyle()}>
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightCode(line) || '&nbsp;',
                }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  let leftLineNumber = 1;
  let rightLineNumber = 1;

  const rows: {
    left: string;
    right: string;
    leftType: 'unchanged' | 'removed' | 'empty';
    rightType: 'unchanged' | 'added' | 'empty';
  }[] = [];

  for (let i = 0; i < diffParts.length; i++) {
    const part = diffParts[i];
    if (!part.added && !part.removed) {
      const lines = part.value.split('\n').filter((l) => l !== '');
      lines.forEach((line) => {
        rows.push({
          left: line,
          right: line,
          leftType: 'unchanged',
          rightType: 'unchanged',
        });
      });
    } else if (
      part.removed &&
      i + 1 < diffParts.length &&
      diffParts[i + 1].added
    ) {
      const removedLines = part.value.split('\n').filter((l) => l !== '');
      const addedLines = diffParts[i + 1].value
        .split('\n')
        .filter((l) => l !== '');
      const maxLen = Math.max(removedLines.length, addedLines.length);
      for (let j = 0; j < maxLen; j++) {
        rows.push({
          left: removedLines[j] || '',
          right: addedLines[j] || '',
          leftType: removedLines[j] ? 'removed' : 'empty',
          rightType: addedLines[j] ? 'added' : 'empty',
        });
      }
      i++;
    } else if (part.removed) {
      const lines = part.value.split('\n').filter((l) => l !== '');
      lines.forEach((line) => {
        rows.push({
          left: line,
          right: '',
          leftType: 'removed',
          rightType: 'empty',
        });
      });
    } else if (part.added) {
      const lines = part.value.split('\n').filter((l) => l !== '');
      lines.forEach((line) => {
        rows.push({
          left: '',
          right: line,
          leftType: 'empty',
          rightType: 'added',
        });
      });
    }
  }

  const getLeftCellStyle = (type: 'unchanged' | 'removed' | 'empty') => {
    switch (type) {
      case 'removed':
        return getRemovedStyle();
      case 'unchanged':
        return getUnchangedStyle();
      default:
        return getUnchangedStyle();
    }
  };

  const getRightCellStyle = (type: 'unchanged' | 'added' | 'empty') => {
    switch (type) {
      case 'added':
        return getAddedStyle();
      case 'unchanged':
        return getUnchangedStyle();
      default:
        return getUnchangedStyle();
    }
  };

  const rowHeight = 24;
  const extraRows = Math.max(
    0,
    Math.floor(containerHeight / rowHeight) - rows.length,
  );

  return (
    <div style={containerStyle} ref={containerRef}>
      {rows.map((row, index) => {
        const leftNumber = row.left !== '' ? leftLineNumber++ : '';
        const rightNumber = row.right !== '' ? rightLineNumber++ : '';
        return (
          <React.Fragment key={index}>
            <div style={lineNumberCellStyle}>{leftNumber || ' '}</div>
            <div style={getLeftCellStyle(row.leftType)}>
              <code
                dangerouslySetInnerHTML={{
                  __html: row.left ? highlightCode(row.left) : '&nbsp;',
                }}
              />
            </div>
            <div style={lineNumberCellStyle}>{rightNumber || ' '}</div>
            <div style={getRightCellStyle(row.rightType)}>
              <code
                dangerouslySetInnerHTML={{
                  __html: row.right ? highlightCode(row.right) : '&nbsp;',
                }}
              />
            </div>
          </React.Fragment>
        );
      })}
      {Array.from({ length: extraRows }).map((_, i) => (
        <React.Fragment key={`dummy-${i}`}>
          <div style={lineNumberCellStyle}>&nbsp;</div>
          <div style={baseCodeCellStyle}>
            <code>&nbsp;</code>
          </div>
          <div style={lineNumberCellStyle}>&nbsp;</div>
          <div style={baseCodeCellStyle}>
            <code>&nbsp;</code>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default DiffViewer;
