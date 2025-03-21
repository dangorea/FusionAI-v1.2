import type { Ref, RefObject } from 'react';
import React from 'react';
import { Button, Layout } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { CodeViewer } from '../code-viewer';
import { TaskDescription } from '../task-description';
import styles from './content-area.module.scss';
import type { DropdownRef } from '../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectProviders,
  selectSelectedProviderEntity,
} from '../../../../lib/redux/feature/config/selectors';
import { setSelectedProvider } from '../../../../lib/redux/feature/config/reducer';

const { Content } = Layout;

interface ContentAreaProps {
  showCodeViewer: boolean;
  originalFileContent: string;
  comparisonFileContent?: string;
  bigTaskDescRef: RefObject<any>;
  handleSend: () => void;
  disableSend: boolean;
  updateWorkItemDebounced: (value: string) => void;
  dropdownRef?: Ref<DropdownRef>;
  onClosePreview?: () => void;
}

export function ContentArea({
  showCodeViewer,
  originalFileContent,
  comparisonFileContent,
  bigTaskDescRef,
  handleSend,
  updateWorkItemDebounced,
  dropdownRef,
  onClosePreview,
  disableSend,
}: ContentAreaProps) {
  const dispatch = useAppDispatch();
  const showCloseViewerButton =
    originalFileContent !== undefined && !comparisonFileContent;
  const providers = useAppSelector(selectProviders).map((provider) => ({
    label: provider.name,
    value: provider.id,
  }));
  const selectedProvider = useAppSelector(selectSelectedProviderEntity);

  const handleProviderChange = (value: string | string[]) => {
    dispatch(setSelectedProvider(value as string));
  };

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
            onDropdownChange={handleProviderChange}
            mode="big"
            dropdownOptions={providers}
            defaultDropdownValue={selectedProvider?.id ?? providers[3].value}
            disableSend={disableSend}
            onContentChange={(value) => {
              updateWorkItemDebounced(value);
            }}
          />
        </div>

        {showCodeViewer && (
          <div style={{ position: 'relative', height: '100%' }}>
            {showCloseViewerButton ? (
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
            ) : null}

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
