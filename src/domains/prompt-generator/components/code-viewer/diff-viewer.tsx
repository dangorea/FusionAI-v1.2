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
  const cleanedOriginal = originalCode.trimEnd();
  const cleanedModified = modifiedCode.trimEnd();

  const diffParts = diffLines(cleanedOriginal, cleanedModified);

  const highlightCode = (code: string) => {
    const grammar = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, language);
  };

  const isNewFile = !cleanedOriginal.trim();

  const defaultBaseCodeCellStyle: React.CSSProperties = {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.2',
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
    lineHeight: '1.2',
    verticalAlign: 'middle',
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

  const getFillerStyle = (): React.CSSProperties => ({
    ...baseCodeCellStyle,
    backgroundColor: 'transparent',
  });

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

  const rowHeight = 16;

  if (isNewFile) {
    const lines = cleanedModified.split('\n').filter((l, i, arr) => {
      return !(l === '' && i === arr.length - 1);
    });

    const totalRows = lines.length;

    const codeLines = lines.map((line, index) => (
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
    ));

    const fillerElements = (() => {
      const usedHeight = totalRows * rowHeight;
      if (usedHeight >= containerHeight) {
        return null;
      }

      const extraRows = Math.max(
        0,
        Math.floor((containerHeight - usedHeight) / rowHeight),
      );
      return Array.from({ length: extraRows }).map((_, i) => (
        <React.Fragment key={`filler-${i}`}>
          <div style={lineNumberCellStyle}>&nbsp;</div>
          <div style={getFillerStyle()}>
            <code>&nbsp;</code>
          </div>
        </React.Fragment>
      ));
    })();

    return (
      <div style={containerStyle} ref={containerRef}>
        {codeLines}
        {fillerElements}
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

  const totalRows = rows.length;

  const rowElements = rows.map((row, index) => {
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
  });

  const fillerElements = (() => {
    const usedHeight = totalRows * rowHeight;
    if (usedHeight >= containerHeight) {
      return null;
    }
    const extraRows = Math.max(
      0,
      Math.floor((containerHeight - usedHeight) / rowHeight),
    );
    return Array.from({ length: extraRows }).map((_, i) => (
      <React.Fragment key={`filler-${i}`}>
        <div style={lineNumberCellStyle}>&nbsp;</div>
        <div style={getUnchangedStyle()}>
          <code>&nbsp;</code>
        </div>
        <div style={lineNumberCellStyle}>&nbsp;</div>
        <div style={getUnchangedStyle()}>
          <code>&nbsp;</code>
        </div>
      </React.Fragment>
    ));
  })();

  return (
    <div style={containerStyle} ref={containerRef}>
      {rowElements}
      {fillerElements}
    </div>
  );
}

export default DiffViewer;
