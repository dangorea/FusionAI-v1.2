import React from 'react';
import { diffLines } from 'diff';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

export interface CustomSideBySideDiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
}

interface DiffRow {
  left: string;
  right: string;
  leftType: 'unchanged' | 'removed';
  rightType: 'unchanged' | 'added';
}

const CustomSideBySideDiffViewer: React.FC<CustomSideBySideDiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language = 'typescript',
}) => {
  const computeDiffRows = (): DiffRow[] => {
    const diffParts = diffLines(originalCode, modifiedCode);
    const rows: DiffRow[] = [];

    for (let i = 0; i < diffParts.length; i++) {
      const part = diffParts[i];
      if (!part.added && !part.removed) {
        const lines = part.value.split('\n');
        const filteredLines =
          lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines;
        filteredLines.forEach((line) => {
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
            leftType: 'removed',
            rightType: 'added',
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
            rightType: 'added',
          });
        });
      } else if (part.added) {
        const lines = part.value.split('\n').filter((l) => l !== '');
        lines.forEach((line) => {
          rows.push({
            left: '',
            right: line,
            leftType: 'removed',
            rightType: 'added',
          });
        });
      }
    }
    return rows;
  };

  const diffRows = computeDiffRows();

  const baseCodeCellStyle: React.CSSProperties = {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    padding: '2px 4px',
    whiteSpace: 'pre',
    overflow: 'hidden',
  };

  const getCodeCellStyle = (
    type: 'unchanged' | 'removed' | 'added',
  ): React.CSSProperties => {
    let background = 'transparent';
    if (type === 'removed') {
      background = '#3f2d2d';
    } else if (type === 'added') {
      background = '#294436';
    }
    return { ...baseCodeCellStyle, backgroundColor: background };
  };

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
  };

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '50px 1fr 50px 1fr',
    background: '#1e1e1e',
    color: '#d4d4d4',
    overflow: 'auto',
    width: '100%',
  };

  let leftLineNumber = 1;
  let rightLineNumber = 1;

  return (
    <div style={containerStyle}>
      {diffRows.map((row, index) => {
        const leftNumber = row.left !== '' ? leftLineNumber++ : '';
        const rightNumber = row.right !== '' ? rightLineNumber++ : '';
        
        const grammar = Prism.languages[language] || Prism.languages.javascript;
        const leftHTML = row.left
          ? Prism.highlight(row.left, grammar, language)
          : '';
        const rightHTML = row.right
          ? Prism.highlight(row.right, grammar, language)
          : '';

        return (
          <React.Fragment key={index}>
            {/* Left side line number */}
            <div style={lineNumberCellStyle}>{leftNumber || ' '}</div>
            {/* Left side code */}
            <div style={getCodeCellStyle(row.leftType)}>
              <code
                dangerouslySetInnerHTML={{ __html: leftHTML || '&nbsp;' }}
              />
            </div>
            {/* Right side line number */}
            <div style={lineNumberCellStyle}>{rightNumber || ' '}</div>
            {/* Right side code */}
            <div style={getCodeCellStyle(row.rightType)}>
              <code
                dangerouslySetInnerHTML={{ __html: rightHTML || '&nbsp;' }}
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CustomSideBySideDiffViewer;
