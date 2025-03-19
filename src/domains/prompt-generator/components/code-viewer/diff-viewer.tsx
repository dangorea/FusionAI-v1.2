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
  const displayedOriginal = originalCode
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .trimEnd();

  const displayedModified = modifiedCode
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .trimEnd();

  const diffParts = diffLines(displayedOriginal, displayedModified);

  const highlightCode = (code: string) => {
    const grammar = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, language);
  };

  const isNewFile = !displayedOriginal.trim();

  const defaultBaseCodeCellStyle: React.CSSProperties = {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1',
    padding: '2px 4px',
    whiteSpace: 'pre',
    margin: 0,
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
    lineHeight: '1',
    margin: 0,
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

  const getEmptyStyle = (): React.CSSProperties => ({
    ...baseCodeCellStyle,
    backgroundColor: 'transparent',
  });

  const getLeftCellStyle = (type: 'unchanged' | 'removed' | 'empty') => {
    if (type === 'removed') return getRemovedStyle();
    if (type === 'unchanged') return getUnchangedStyle();
    return getEmptyStyle();
  };

  const getRightCellStyle = (type: 'unchanged' | 'added' | 'empty') => {
    if (type === 'added') return getAddedStyle();
    if (type === 'unchanged') return getUnchangedStyle();
    return getEmptyStyle();
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

  const rowHeight = 18;

  if (isNewFile) {
    const lines = displayedModified.split('\n');
    const totalRows = lines.length;

    return (
      <div style={containerStyle} ref={containerRef}>
        {lines.map((line, idx) => (
          <React.Fragment key={idx}>
            <div style={lineNumberCellStyle}>{idx + 1}</div>
            <div style={getAddedStyle()}>
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightCode(line) || '&nbsp;',
                }}
              />
            </div>
          </React.Fragment>
        ))}

        {/* Filler lines only if leftover space at bottom */}
        {(() => {
          const usedSpace = totalRows * rowHeight;
          if (usedSpace >= containerHeight) return null;

          const extraRowCount = Math.floor(
            (containerHeight - usedSpace) / rowHeight,
          );
          return Array.from({ length: extraRowCount }).map((_, i) => (
            <React.Fragment key={`filler-${i}`}>
              <div style={lineNumberCellStyle}>&nbsp;</div>
              <div style={getEmptyStyle()}>
                <code>&nbsp;</code>
              </div>
            </React.Fragment>
          ));
        })()}
      </div>
    );
  }

  let leftLineNum = 1;
  let rightLineNum = 1;

  const rows: {
    left: string;
    right: string;
    leftType: 'unchanged' | 'removed' | 'empty';
    rightType: 'unchanged' | 'added' | 'empty';
  }[] = [];

  for (let i = 0; i < diffParts.length; i++) {
    const part = diffParts[i];
    const lines = part.value.split('\n');
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    if (!part.added && !part.removed) {
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
      const removedLines = lines;
      const nextPart = diffParts[i + 1];
      const addedLines = nextPart.value.split('\n');
      if (addedLines[addedLines.length - 1] === '') {
        addedLines.pop();
      }

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
      lines.forEach((line) => {
        rows.push({
          left: line,
          right: '',
          leftType: 'removed',
          rightType: 'empty',
        });
      });
    } else if (part.added) {
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

  return (
    <div style={containerStyle} ref={containerRef}>
      {rows.map((row, idx) => {
        const leftNum = row.left ? leftLineNum++ : '';
        const rightNum = row.right ? rightLineNum++ : '';
        return (
          <React.Fragment key={idx}>
            <div style={lineNumberCellStyle}>{leftNum || ' '}</div>
            <div style={getLeftCellStyle(row.leftType)}>
              <code
                dangerouslySetInnerHTML={{
                  __html: row.left ? highlightCode(row.left) : '&nbsp;',
                }}
              />
            </div>

            <div style={lineNumberCellStyle}>{rightNum || ' '}</div>
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

      {(() => {
        const usedSpace = rows.length * rowHeight;
        if (usedSpace >= containerHeight) return null;

        const extraRowCount = Math.floor(
          (containerHeight - usedSpace) / rowHeight,
        );
        return Array.from({ length: extraRowCount }).map((_, i) => (
          <React.Fragment key={`filler-${i}`}>
            <div style={lineNumberCellStyle}>&nbsp;</div>
            <div style={getEmptyStyle()}>
              <code>&nbsp;</code>
            </div>
            <div style={lineNumberCellStyle}>&nbsp;</div>
            <div style={getEmptyStyle()}>
              <code>&nbsp;</code>
            </div>
          </React.Fragment>
        ));
      })()}
    </div>
  );
}

export default DiffViewer;
