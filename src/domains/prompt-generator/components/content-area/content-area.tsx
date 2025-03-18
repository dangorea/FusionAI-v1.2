import type { Ref, RefObject } from 'react';
import React from 'react';
import { Layout } from 'antd';
import { CodeViewer, TaskDescription } from '..';
import styles from './content-area.module.scss';
import type { DropdownRef } from '../../../../components';

const { Content } = Layout;

interface ContentAreaProps {
  showCodeViewer: boolean;
  originalFileContent: string;
  comparisonFileContent?: string;
  bigTaskDescRef: RefObject<any>;
  dropdownRef?: Ref<DropdownRef>;
  handleSend: () => void;
  onDropdownChange?: () => string;
  updateWorkItemDebounced: () => void;
}

export function ContentArea({
  showCodeViewer,
  originalFileContent,
  comparisonFileContent,
  bigTaskDescRef,
  handleSend,
  updateWorkItemDebounced,
  onDropdownChange,
  dropdownRef,
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
              dropdownRef={dropdownRef}
              onSend={handleSend}
              onDropdownChange={onDropdownChange}
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
