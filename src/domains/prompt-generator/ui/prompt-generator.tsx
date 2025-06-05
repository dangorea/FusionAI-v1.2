import { Drawer, Layout } from 'antd';
import { useMemo } from 'react';
import {
  CodeViewer,
  ContentArea,
  FileTreePanel,
  HistoryPanel,
  ImageGallery,
  Loading,
  Sidebar,
  TaskDescriptionFooter,
  TaskDescriptionHeader,
} from '../components';
import { useImages, usePromptGenerator } from '../hooks';
import styles from './prompt-generator.module.scss';
import { useAppSelector } from '../../../lib/redux/hook';
import {
  selectAllKnowledgeTextBlocks,
  selectAllPersonalityTextBlocks,
} from '../../../lib/redux/feature/text-blocks/selectors';
import {
  selectCodeGenerationSelectedIterationId,
  selectSelectedIteration,
} from '../../../lib/redux/feature/artifacts/selectors';
import type { DropdownOption } from '../../../components/dropdown/dropdown';

export function PromptGenerator() {
  const knowledgeTextBlocks = useAppSelector(selectAllKnowledgeTextBlocks);
  const personalities = useAppSelector(selectAllPersonalityTextBlocks);
  const personalityOptions: DropdownOption[] = personalities.map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const selectedIteration = useAppSelector(selectSelectedIteration);
  const selectedIterationId = useAppSelector(
    selectCodeGenerationSelectedIterationId,
  );

  const {
    imageGalleryVisible,
    showImageGallery,
    hideImageGallery,
    selectedImageIds,
    setSelectedImageIds,
  } = useImages();

  const {
    workItemId,
    isLoading,
    codeGenExists,
    showCodeViewer,
    errorMessage,
    forceHideComparisonFileTree,
    unmodifiedFileContent,
    setUnmodifiedFileContent,
    originalFileContent,
    comparisonFileContent,
    bigTaskDescRef,
    smallTaskDescRef,
    previewTaskDescRef,
    dropdownProviderRef,
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
    selectedFilePath,
    selectedUnmodifiedFilePath,
    fileTreeProps,
    fileTreeSideBarProps,
    historyOptions,
    selectedRules,
    handleMultipleSelect,
    onRulesSelected,
    handleSingleSelect,
    handleSend,
    handleClosePreview,
    handleApplyChanges,
    handleHistoryOptionClick,
    handleEditIteration,
    updateTaskDescription,
    disableSendBigTaskDescription,
    disableSmallTaskDescription,
    disablePreviewTaskDescription,
    onBigTaskDescMount,
    handlePreviewTaskDescMount,
    setBigTaskDescription,
    setSmallTaskDescription,
    setPreviewTaskDescription,
    setUserIsEditing,
    setHasLocalDescriptionChanged,
    previewTaskDescriptionPreviewMode,
    sidebarSelectedFiles,
    handleSidebarMultipleSelect,
    handleSidebarSingleSelect,
  } = usePromptGenerator();

  const personalityDefaultIds = useMemo(
    () => selectedIteration?.personalities?.map((p) => p.id) || [],
    [selectedIteration],
  );

  return (
    <>
      <Layout className={styles.promptGeneratorContainer}>
        <FileTreePanel
          workItemId={workItemId}
          fileTreeProps={fileTreeProps}
          handleMultipleSelect={handleMultipleSelect}
          handleSingleSelect={handleSingleSelect}
          rules={knowledgeTextBlocks}
          selectedRules={selectedRules}
          onRulesSelected={onRulesSelected}
        />

        <Layout className={styles['ide-layout']}>
          <TaskDescriptionHeader
            key={`task-description-header-${workItemId}`}
            ref={previewTaskDescRef}
            dropdownProviderRef={dropdownProviderRef}
            personalities={personalityOptions}
            personalityDropdownRef={personalityDropdownHeaderRef}
            preview={previewTaskDescriptionPreviewMode}
            codeGenExists={showCodeViewer && codeGenExists}
            onEdit={handleEditIteration}
            onMount={handlePreviewTaskDescMount}
            handleSend={handleSend}
            disableSend={disablePreviewTaskDescription}
            updateWorkItemDebounced={(v) => setPreviewTaskDescription(v)}
            onImagesButtonClick={showImageGallery}
            personalityDefaultDropDownValue={personalityDefaultIds}
          />

          <Layout className={styles['ide-container']}>
            <Loading loading={isLoading}>
              <Sidebar
                key={`sidebar-${workItemId}`}
                fileTreeProps={fileTreeSideBarProps}
                codeGenExists={codeGenExists && !forceHideComparisonFileTree}
                handleMultipleSelect={handleSidebarMultipleSelect}
                handleSingleSelect={handleSidebarSingleSelect}
                handleApplyChanges={handleApplyChanges}
                sidebarSelectedFiles={sidebarSelectedFiles}
              />

              <ContentArea
                key={`content-area-${workItemId}`}
                showCodeViewer={showCodeViewer}
                originalFileContent={originalFileContent}
                comparisonFileContent={comparisonFileContent}
                bigTaskDescRef={bigTaskDescRef}
                onTaskDescriptionMount={onBigTaskDescMount}
                dropdownProviderRef={dropdownProviderRef}
                personalityDropdownRef={personalityDropdownContentRef}
                personalities={personalityOptions}
                selectedFilePath={selectedFilePath}
                handleSend={handleSend}
                disableSend={disableSendBigTaskDescription}
                updateTaskDescription={(v) => {
                  setUserIsEditing(true);
                  setHasLocalDescriptionChanged(true);
                  setBigTaskDescription(v);
                  updateTaskDescription();
                }}
                onClosePreview={handleClosePreview}
                errorMessage={errorMessage}
                onImagesButtonClick={showImageGallery}
              />
            </Loading>
          </Layout>

          <TaskDescriptionFooter
            key={`task-description-footer-${workItemId}`}
            ref={smallTaskDescRef}
            dropdownProviderRef={dropdownProviderRef}
            personalityDropdownRef={personalityDropdownFooterRef}
            codeGenExists={showCodeViewer && codeGenExists}
            handleSend={handleSend}
            disableSend={disableSmallTaskDescription}
            personalities={personalityOptions}
            updateWorkItemDebounced={(v) => setSmallTaskDescription(v)}
            onImagesButtonClick={showImageGallery}
          />
        </Layout>

        <HistoryPanel
          workItemId={workItemId}
          historyOptions={historyOptions}
          handleHistoryOptionClick={handleHistoryOptionClick}
          selectedHistoryId={selectedIterationId}
        />
      </Layout>

      <Drawer
        title={(selectedUnmodifiedFilePath || '').split('/').pop()}
        placement="right"
        closable
        onClose={() => setUnmodifiedFileContent('')}
        open={!!unmodifiedFileContent}
        key="right"
        size="large"
      >
        <CodeViewer
          filePath={selectedUnmodifiedFilePath}
          code={unmodifiedFileContent}
          language="typescript"
        />
      </Drawer>

      <ImageGallery
        visible={imageGalleryVisible}
        onClose={hideImageGallery}
        selectedImageIds={selectedImageIds}
        setSelectedImageIds={setSelectedImageIds}
      />
    </>
  );
}
