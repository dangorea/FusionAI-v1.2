import type { RefObject } from 'react';
import React, { Fragment, useMemo } from 'react';
import { displayedModified } from '../../helpers';
import styles from './styles.module.scss';
import type { DiffViewerStyleOverrides } from '../../index';

type Props = {
  modifiedCode: string;
  styleOverrides?: DiffViewerStyleOverrides;
  containerRef: RefObject<HTMLDivElement | null>;
  highlightCode: (text: string) => string;
};

function NewFile({
  modifiedCode,
  styleOverrides,
  containerRef,
  highlightCode,
}: Props) {
  const lines = useMemo(
    () => displayedModified(modifiedCode).split('\n'),
    [modifiedCode],
  );

  const scrollContainerStyle = useMemo<string>(
    () => `
            .diff-viewer-scroll::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .diff-viewer-scroll::-webkit-scrollbar-track {
              background: #1e1e1e;
            }
            .diff-viewer-scroll::-webkit-scrollbar-thumb {
              background: #555;
              border-radius: 4px;
            }
            .diff-viewer-scroll {
              scrollbar-color: #555 #1e1e1e;
              scrollbar-width: thin;
            }
          `,
    [],
  );

  return (
    <>
      <style>{scrollContainerStyle}</style>
      <div
        className={`diff-viewer-scroll ${styles.defaultContainerStyle}`}
        style={{
          ...styleOverrides?.container,
          ...styleOverrides?.leftContainer,
        }}
        ref={containerRef}
      >
        {lines.map((line, index) => (
          <div key={index} style={{ display: 'flex', height: '18px' }}>
            <div
              className={styles.defaultLineNumberCellStyle}
              style={{ ...styleOverrides?.lineNumber }}
            >
              {index + 1}
            </div>
            <div
              className={styles.defaultBaseCodeCellStyle}
              style={{
                backgroundColor: '#294436',
                ...styleOverrides?.addedCodeCell,
                ...styleOverrides?.baseCodeCell,
              }}
            >
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightCode(line) || '&nbsp;',
                }}
              />
            </div>
          </div>
        ))}
        <div key="extra-line" style={{ display: 'flex', height: '18px' }}>
          <div
            className={styles.defaultLineNumberCellStyle}
            style={{ ...styleOverrides?.lineNumber }}
          >
            {lines.length + 1}
          </div>
          <div
            className={styles.defaultBaseCodeCellStyle}
            style={{
              backgroundColor: '#294436',
              ...styleOverrides?.addedCodeCell,
              ...styleOverrides?.baseCodeCell,
            }}
          >
            <code>&nbsp;</code>
          </div>
        </div>
      </div>
    </>
  );
}

export { NewFile };
