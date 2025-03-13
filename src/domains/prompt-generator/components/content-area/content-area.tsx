import React from 'react';
import { Layout } from 'antd';
import { CodeViewer, TaskDescription } from '..';
import styles from './content-area.module.scss';

const { Content } = Layout;

interface ContentAreaProps {
  showCodeViewer: boolean;
  originalFileContent: string;
  comparisonFileContent?: string;
  bigTaskDescRef: React.RefObject<any>;
  handleSend: () => void;
  updateWorkItemDebounced: () => void;
}

export function ContentArea({
  showCodeViewer,
  originalFileContent,
  comparisonFileContent,
  bigTaskDescRef,
  handleSend,
  updateWorkItemDebounced,
}: ContentAreaProps) {
  return (
    <Layout className={styles.mainLayout}>
      <Content className={styles.content}>
        {showCodeViewer ? (
          <CodeViewer
            originalCode={originalFileContent}
            modifiedCode={comparisonFileContent}
            code={originalFileContent}
            language="typescript"
            singleViewerStyleOverrides={{
              container: {
                borderBottomRightRadius: '8px',
                borderTopRightRadius: '8px',
              },
            }}
            diffViewerStyleOverrides={{
              container: {
                borderBottomRightRadius: '8px',
                borderTopRightRadius: '8px',
              },
            }}
          />
        ) : (
          <div className={styles.taskCreationContainer}>
            <TaskDescription
              ref={bigTaskDescRef}
              onSend={handleSend}
              mode="big"
              onContentChange={() => {
                updateWorkItemDebounced();
              }}
            />
          </div>
        )}
      </Content>
    </Layout>
  );
}
