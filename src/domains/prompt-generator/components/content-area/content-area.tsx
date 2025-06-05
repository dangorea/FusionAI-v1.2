import type { Ref, RefObject } from 'react';
import React from 'react';
import { Button, Layout } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { CodeViewer } from '../code-viewer';
import {
  TaskDescription,
  type TaskDescriptionInputRef,
} from '../task-description';
import styles from './content-area.module.scss';
import type { DropdownRef } from '../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectDefaultProvider,
  selectProviders,
  selectSelectedProviderEntity,
} from '../../../../lib/redux/feature/config/selectors';
import { setSelectedProvider } from '../../../../lib/redux/feature/config/reducer';
import type { DropdownOption } from '../../../../components/dropdown/dropdown';

const { Content } = Layout;

interface ContentAreaProps {
  showCodeViewer: boolean;
  originalFileContent: string;
  comparisonFileContent?: string;
  bigTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  handleSend: () => void;
  disableSend: boolean;
  updateTaskDescription: (value: string) => void;
  selectedFilePath?: string;
  dropdownProviderRef?: Ref<DropdownRef>;
  personalityDropdownRef?: Ref<DropdownRef>;
  personalities?: DropdownOption[];
  onClosePreview?: () => void;
  onTaskDescriptionMount?: (api: TaskDescriptionInputRef) => void;
  errorMessage?: string;
  onImagesButtonClick?: () => void;
  personalityDefaultDropDownValue?: string | string[];
}

export function ContentArea({
  showCodeViewer,
  originalFileContent,
  comparisonFileContent,
  bigTaskDescRef,
  handleSend,
  updateTaskDescription,
  selectedFilePath,
  dropdownProviderRef,
  personalityDropdownRef,
  personalities,
  onClosePreview,
  disableSend,
  onTaskDescriptionMount,
  errorMessage,
  onImagesButtonClick,
  personalityDefaultDropDownValue,
}: ContentAreaProps) {
  const dispatch = useAppDispatch();
  const showCloseViewerButton =
    originalFileContent !== undefined && comparisonFileContent === undefined;
  const providers = useAppSelector(selectProviders).map((provider) => ({
    label: provider.name,
    value: provider.id,
  }));
  const selectedProvider = useAppSelector(selectSelectedProviderEntity);
  const defaultProvider = useAppSelector(selectDefaultProvider);
  const defaultDropdownValue =
    selectedProvider?.id ||
    (defaultProvider ? defaultProvider.id : '') ||
    (providers.length > 0 ? providers[0].value : '');

  const handleProviderChange = (value: string | string[]) => {
    dispatch(setSelectedProvider(value as string));
  };

  return (
    <Layout className={styles.mainLayout}>
      <Content
        className={styles.content}
        style={
          !errorMessage
            ? {
                borderBottomLeftRadius: 8,
                borderTopLeftRadius: 8,
                ...(!showCodeViewer
                  ? { borderLeft: '1px solid #d8dbf4' }
                  : undefined),
              }
            : undefined
        }
      >
        {errorMessage ? (
          <div className={styles.errorMessage}>{errorMessage}</div>
        ) : (
          <>
            <div
              className={styles.taskCreationContainer}
              style={{ display: showCodeViewer ? 'none' : 'block' }}
            >
              <TaskDescription
                ref={bigTaskDescRef}
                onMount={onTaskDescriptionMount}
                dropdownProviderRef={dropdownProviderRef}
                personalityDropdownRef={personalityDropdownRef}
                personalityDefaultDropDownValue={
                  personalityDefaultDropDownValue
                }
                onSend={handleSend}
                onDropdownProviderChange={handleProviderChange}
                mode="big"
                dropdownOptions={providers}
                defaultDropdownValue={defaultDropdownValue}
                personalityOptions={personalities}
                disableSend={disableSend}
                onContentChange={updateTaskDescription}
                onImagesButtonClick={onImagesButtonClick}
              />
            </div>

            {showCodeViewer && (
              <div style={{ position: 'relative', height: '100%' }}>
                {showCloseViewerButton && (
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
                )}

                <CodeViewer
                  filePath={selectedFilePath}
                  originalCode={originalFileContent}
                  modifiedCode={comparisonFileContent}
                  code={originalFileContent}
                  language="typescript"
                  singleViewerStyleOverrides={{
                    container: {
                      borderBottomRightRadius: '8px',
                    },
                  }}
                  diffViewerStyleOverrides={{
                    rightContainer: {
                      borderBottomRightRadius: '8px',
                    },
                    ...(!comparisonFileContent
                      ? {
                          borderBottomRightRadius: '8px',
                        }
                      : undefined),
                    leftContainer: {
                      ...(!originalFileContent
                        ? {
                            borderBottomRightRadius: '8px',
                          }
                        : undefined),
                    },
                  }}
                  filePathStyleOverrides={{ borderTopRightRadius: '8px' }}
                />
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
}
