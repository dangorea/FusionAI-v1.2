import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';
import styles from './styles.module.scss';

export interface SingleViewerStyleOverrides {
  container?: CSSProperties;
  lineNumber?: CSSProperties;
  baseCodeCell?: CSSProperties;
}

export interface SingleCodeViewerProps {
  code: string;
  language?: string;
  styleOverrides?: SingleViewerStyleOverrides;
}

const rowHeight = 18;

function SingleCodeViewer({
  code,
  language = 'typescript',
  styleOverrides = {},
}: SingleCodeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null as HTMLDivElement);

  const [containerHeight, setContainerHeight] = useState(0);

  const displayedCode = useMemo(
    () => code.replace(/\\r/g, '\r').replace(/\\n/g, '\n'),
    [code],
  );

  const lines = useMemo(
    () => displayedCode.trimEnd().split(/\r?\n/),
    [displayedCode],
  );

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

  const highlight = useCallback(
    (text: string) => {
      const grammar = Prism.languages[language] || Prism.languages.javascript;
      return Prism.highlight(text, grammar, language || '');
    },
    [language],
  );

  return (
    <div
      className={styles.defaultContainerStyle}
      style={{ ...styleOverrides?.container }}
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
            style={{ ...styleOverrides?.baseCodeCell }}
          >
            <code
              dangerouslySetInnerHTML={{
                __html: highlight(line) || '&nbsp;',
              }}
            />
          </div>
        </div>
      ))}
      {lines.length * rowHeight >= containerHeight && (
        <div key="extra-filler" style={{ display: 'flex', height: '18px' }}>
          <div
            className={styles.defaultLineNumberCellStyle}
            style={{ ...styleOverrides?.lineNumber }}
          >
            &nbsp;
          </div>
          <div
            className={styles.defaultBaseCodeCellStyle}
            style={{ ...styleOverrides?.baseCodeCell }}
          >
            <code>&nbsp;</code>
          </div>
        </div>
      )}
    </div>
  );
}

export { SingleCodeViewer };
