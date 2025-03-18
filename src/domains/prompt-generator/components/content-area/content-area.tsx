import type { Ref, RefObject } from 'react';
import React from 'react';
import { Button, Layout } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
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
  onClosePreview?: () => void;
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
  onClosePreview,
}: ContentAreaProps) {
  return (
    <Layout className={styles.mainLayout}>
      <Content className={styles.content}>
        <div
          className={styles.taskCreationContainer}
          style={{ display: showCodeViewer ? 'none' : 'block' }}
        >
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

        {showCodeViewer && (
          <div style={{ position: 'relative', height: '100%' }}>
            <Button
              icon={<CloseCircleOutlined />}
              shape="circle"
              onClick={onClosePreview}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                opacity: 0.2,
                transition: 'opacity 0.2s ease-in-out',
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.40';
              }}
            />

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
          </div>
        )}
      </Content>
    </Layout>
  );
}
