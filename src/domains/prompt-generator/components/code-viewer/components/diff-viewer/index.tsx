import type { CSSProperties, UIEvent } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { diffLines } from 'diff';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';
import {
  displayedModified,
  displayedOriginal,
  getLeftCellStyle,
  getRightCellStyle,
  scrollContainerStyle,
} from './helpers';
import styles from './styles.module.scss';
import { NewFile } from './components';

export interface DiffViewerStyleOverrides {
  container?: CSSProperties;
  lineNumber?: CSSProperties;
  baseCodeCell?: CSSProperties;
  addedCodeCell?: CSSProperties;
  removedCodeCell?: CSSProperties;
  unchangedCodeCell?: CSSProperties;
  rightContainer?: CSSProperties;
  leftContainer?: CSSProperties;
}

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  styleOverrides?: DiffViewerStyleOverrides;
}

type RowType = {
  left: string;
  right: string;
  leftType: 'unchanged' | 'removed' | 'empty';
  rightType: 'unchanged' | 'added' | 'empty';
};

const rowHeight = 18;
const scrollContainerClass = 'diff-viewer-scroll';

function DiffViewer({
  originalCode,
  modifiedCode,
  language = 'typescript',
  styleOverrides = {},
}: DiffViewerProps) {
  const leftPanelOuterRef = useRef<HTMLDivElement | null>(null);
  const rightPanelOuterRef = useRef<HTMLDivElement | null>(null);
  const leftCodeRef = useRef<HTMLDivElement | null>(null);
  const rightCodeRef = useRef<HTMLDivElement | null>(null);
  const isSyncingVertical = useRef(false);
  const isSyncingHorizontal = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [rows, setRows] = useState<RowType[]>([]);

  const handleLeftPanelScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isSyncingVertical.current) return;
    isSyncingVertical.current = true;
    rightPanelOuterRef.current!.scrollTop = e.currentTarget.scrollTop;
    isSyncingVertical.current = false;
  }, []);

  const handleRightPanelScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isSyncingVertical.current) return;
    isSyncingVertical.current = true;
    leftPanelOuterRef.current!.scrollTop = e.currentTarget.scrollTop;
    isSyncingVertical.current = false;
  }, []);

  const handleLeftCodeScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isSyncingHorizontal.current) return;
    isSyncingHorizontal.current = true;
    rightCodeRef.current!.scrollLeft = e.currentTarget.scrollLeft;
    isSyncingHorizontal.current = false;
  }, []);

  const handleRightCodeScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isSyncingHorizontal.current) return;
    isSyncingHorizontal.current = true;
    leftCodeRef.current!.scrollLeft = e.currentTarget.scrollLeft;
    isSyncingHorizontal.current = false;
  }, []);

  const highlightCode = useCallback(
    (code: string) => {
      const grammar = Prism.languages[language] || Prism.languages.javascript;
      return Prism.highlight(code, grammar, language!);
    },
    [language],
  );

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const diffParts = useMemo(
    () =>
      diffLines(
        displayedOriginal(originalCode),
        displayedModified(modifiedCode),
      ),
    [originalCode, modifiedCode],
  );

  useEffect(() => {
    const newRows: RowType[] = [];
    for (let idx = 0; idx < diffParts.length; idx++) {
      const part = diffParts[idx];
      const lines = part.value
        .replace(/\r/g, '\r')
        .replace(/\n$/, '')
        .split('\n');

      if (!part.added && !part.removed) {
        lines.forEach((line) =>
          newRows.push({
            left: line,
            right: line,
            leftType: 'unchanged',
            rightType: 'unchanged',
          }),
        );
      } else if (part.removed && diffParts[idx + 1]?.added) {
        const addedLines = diffParts[idx + 1].value
          .replace(/\r/g, '\r')
          .replace(/\n$/, '')
          .split('\n');
        const maxLen = Math.max(lines.length, addedLines.length);

        for (let i = 0; i < maxLen; i++) {
          const oldLine = lines[i] ?? '';
          const newLine = addedLines[i] ?? '';

          if (oldLine === newLine) {
            newRows.push({
              left: oldLine,
              right: newLine,
              leftType: 'unchanged',
              rightType: 'unchanged',
            });
          } else if (oldLine && newLine) {
            newRows.push({
              left: oldLine,
              right: newLine,
              leftType: 'removed',
              rightType: 'added',
            });
          } else if (oldLine) {
            newRows.push({
              left: oldLine,
              right: '',
              leftType: 'removed',
              rightType: 'empty',
            });
          } else {
            newRows.push({
              left: '',
              right: newLine,
              leftType: 'empty',
              rightType: 'added',
            });
          }
        }

        idx++;
      } else if (part.removed) {
        lines.forEach((line) =>
          newRows.push({
            left: line,
            right: '',
            leftType: 'removed',
            rightType: 'empty',
          }),
        );
      } else if (part.added) {
        lines.forEach((line) =>
          newRows.push({
            left: '',
            right: line,
            leftType: 'empty',
            rightType: 'added',
          }),
        );
      }
    }
    setRows(newRows);
  }, [diffParts]);

  const extraRowCount = useMemo(() => {
    const used = rows.length * rowHeight;
    if (used > containerHeight) return 0;
    return Math.floor((containerHeight - used) / rowHeight);
  }, [rows, containerHeight]);

  const fillerLeftLineNumbers = useMemo(
    () =>
      Array.from({ length: extraRowCount }).map((_, i) => (
        <div
          key={`filler-left-ln-${i}`}
          className={styles.defaultLineNumberCellStyle}
          style={{ height: rowHeight, ...styleOverrides?.lineNumber }}
        >
          {rows.length + i + 1}
        </div>
      )),
    [extraRowCount, rows.length, styleOverrides],
  );

  const fillerLeftCode = useMemo(
    () =>
      Array.from({ length: extraRowCount }).map((_, i) => (
        <div
          key={`filler-left-code-${i}`}
          className={styles.defaultBaseCodeCellStyle}
          style={{
            height: rowHeight,
            backgroundColor: 'transparent',
            ...styleOverrides?.baseCodeCell,
          }}
        >
          <code>&nbsp;</code>
        </div>
      )),
    [extraRowCount, styleOverrides],
  );

  const fillerRightLineNumbers = useMemo(
    () =>
      Array.from({ length: extraRowCount }).map((_, i) => (
        <div
          key={`filler-right-ln-${i}`}
          className={styles.defaultLineNumberCellStyle}
          style={{ height: rowHeight, ...styleOverrides?.lineNumber }}
        >
          {rows.length + i + 1}
        </div>
      )),
    [extraRowCount, rows.length, styleOverrides],
  );

  const fillerRightCode = useMemo(
    () =>
      Array.from({ length: extraRowCount }).map((_, i) => (
        <div
          key={`filler-right-code-${i}`}
          className={styles.defaultBaseCodeCellStyle}
          style={{
            height: rowHeight,
            backgroundColor: 'transparent',
            ...styleOverrides?.baseCodeCell,
          }}
        >
          <code>&nbsp;</code>
        </div>
      )),
    [extraRowCount, styleOverrides],
  );

  if (!displayedOriginal(originalCode).trim()) {
    return (
      <NewFile
        modifiedCode={modifiedCode}
        containerRef={containerRef}
        highlightCode={highlightCode}
        styleOverrides={styleOverrides}
      />
    );
  }

  return (
    <>
      <style>{scrollContainerStyle(scrollContainerClass)}</style>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div
          ref={leftPanelOuterRef}
          onScroll={handleLeftPanelScroll}
          style={{
            ...styleOverrides?.container,
            ...styleOverrides?.leftContainer,
          }}
          className={`diff-viewer-scroll ${styles.outerPanelStyle}`}
        >
          <div className={styles.panelInnerStyle}>
            <div className={styles.panelLineNumbersStyle}>
              {rows.map((_, i) => (
                <div
                  key={`ln-${i}`}
                  className={styles.defaultLineNumberCellStyle}
                  style={{ height: rowHeight, ...styleOverrides?.lineNumber }}
                >
                  {i + 1}
                </div>
              ))}
              {fillerLeftLineNumbers}
              <div
                className={styles.defaultLineNumberCellStyle}
                style={{ height: rowHeight, ...styleOverrides?.lineNumber }}
              >
                {rows.length + extraRowCount + 1}
              </div>
            </div>
            <div
              ref={leftCodeRef}
              onScroll={handleLeftCodeScroll}
              className={`diff-viewer-scroll ${styles.panelCodeStyle}`}
            >
              <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
                {rows.map((row, i) => (
                  <div
                    key={`left-${i}`}
                    className={styles.defaultBaseCodeCellStyle}
                    style={getLeftCellStyle(
                      row.leftType,
                      rowHeight,
                      styleOverrides,
                    )}
                  >
                    <code
                      dangerouslySetInnerHTML={{
                        __html: row.left ? highlightCode(row.left) : '&nbsp;',
                      }}
                    />
                  </div>
                ))}
              </div>
              {fillerLeftCode}
              <div
                className={styles.defaultBaseCodeCellStyle}
                style={{
                  height: rowHeight,
                  backgroundColor: 'transparent',
                  ...styleOverrides?.baseCodeCell,
                }}
              >
                <code>&nbsp;</code>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={rightPanelOuterRef}
          onScroll={handleRightPanelScroll}
          style={{
            ...styleOverrides?.container,
            ...styleOverrides?.rightContainer,
          }}
          className={`diff-viewer-scroll ${styles.outerPanelStyle}`}
        >
          <div className={styles.panelInnerStyle}>
            <div className={styles.panelLineNumbersStyle}>
              {rows.map((_, i) => (
                <div
                  key={`rln-${i}`}
                  className={styles.defaultLineNumberCellStyle}
                  style={{ height: rowHeight, ...styleOverrides?.lineNumber }}
                >
                  {i + 1}
                </div>
              ))}
              {fillerRightLineNumbers}
              <div
                className={styles.defaultLineNumberCellStyle}
                style={{ height: rowHeight, ...styleOverrides?.lineNumber }}
              >
                {rows.length + extraRowCount + 1}
              </div>
            </div>
            <div
              ref={rightCodeRef}
              onScroll={handleRightCodeScroll}
              className={`diff-viewer-scroll ${styles.panelCodeStyle}`}
            >
              <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
                {rows.map((row, i) => (
                  <div
                    key={`right-${i}`}
                    className={styles.defaultBaseCodeCellStyle}
                    style={getRightCellStyle(
                      row.rightType,
                      rowHeight,
                      styleOverrides,
                    )}
                  >
                    <code
                      dangerouslySetInnerHTML={{
                        __html: row.right ? highlightCode(row.right) : '&nbsp;',
                      }}
                    />
                  </div>
                ))}
              </div>
              {fillerRightCode}
              <div
                className={styles.defaultBaseCodeCellStyle}
                style={{
                  height: rowHeight,
                  backgroundColor: 'transparent',
                  ...styleOverrides?.baseCodeCell,
                }}
              >
                <code>&nbsp;</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { DiffViewer };
