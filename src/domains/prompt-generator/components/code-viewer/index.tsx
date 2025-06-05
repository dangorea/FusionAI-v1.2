import type { CSSProperties, JSX } from 'react';
import type { DiffViewerStyleOverrides } from './components/diff-viewer';
import type { SingleViewerStyleOverrides } from './components/single-code-viewer';
import { DiffViewer, SingleCodeViewer } from './components';
import { FilePath } from './components/file-path';
import styles from './styles.module.scss';

export interface CodeViewerProps {
  filePath?: string;
  code?: string;
  originalCode?: string;
  modifiedCode?: string;
  language?: string;
  diffViewerStyleOverrides?: DiffViewerStyleOverrides;
  singleViewerStyleOverrides?: SingleViewerStyleOverrides;
  filePathStyleOverrides?: CSSProperties;
}

function CodeViewer({
  filePath,
  code,
  originalCode,
  modifiedCode,
  language = 'typescript',
  diffViewerStyleOverrides,
  singleViewerStyleOverrides,
  filePathStyleOverrides,
}: CodeViewerProps) {
  let content: JSX.Element;

  if (originalCode !== undefined && modifiedCode !== undefined) {
    content = (
      <DiffViewer
        originalCode={originalCode}
        modifiedCode={modifiedCode}
        language={language}
        styleOverrides={diffViewerStyleOverrides}
      />
    );
  } else if (code) {
    content = (
      <SingleCodeViewer
        code={code}
        language={language}
        styleOverrides={singleViewerStyleOverrides}
      />
    );
  } else {
    content = <>No code found</>;
  }

  return (
    <div className={styles.containerStyle}>
      <FilePath
        filePath={filePath}
        filePathStyleOverrides={filePathStyleOverrides}
      />
      <div className={styles.dividerStyle} />
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        {content}
      </div>
    </div>
  );
}

export { CodeViewer };
