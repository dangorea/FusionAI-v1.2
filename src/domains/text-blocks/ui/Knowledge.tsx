import { useCallback, useEffect, useState } from 'react';
import { notification } from 'antd';

import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedProject } from '../../../lib/redux/feature/projects/selectors';
import { NOTIFICATION_DURATION_LONG } from '../../../utils/notifications';
import { fetchTextBlocks } from '../../../lib/redux/feature/text-blocks/thunk';
import type { TextBlockType } from '../../../lib/redux/feature/text-blocks/types';
import { TextBlockCategory } from '../../../lib/redux/feature/text-blocks/types';
import { selectAllKnowledgeTextBlocks } from '../../../lib/redux/feature/text-blocks/selectors';

import {
  TextBlockEditor,
  TextBlockHeader,
  TextBlockSidebar,
} from '../components';

import styles from './text-blocks.module.scss';

export function Knowledge() {
  const dispatch = useAppDispatch();
  const allTextBlocks = useAppSelector(selectAllKnowledgeTextBlocks);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const selectedProject = useAppSelector(selectSelectedProject);

  const [selectedTextBlockId, setSelectedTextBlockId] = useState<string | null>(
    null,
  );
  const [scope, setScope] = useState<'organization' | 'project'>(
    'organization',
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Filter text blocks based on scope and project
  const textBlocks = useCallback(() => {
    if (scope === 'organization') {
      return allTextBlocks.filter((block) => !block.projectId);
    }
    if (scope === 'project' && selectedProject?.id) {
      return allTextBlocks.filter(
        (block) => block.projectId === selectedProject.id,
      );
    }
    return [];
  }, [allTextBlocks, scope, selectedProject]);

  const selectedTextBlock =
    textBlocks().find((block) => block.id === selectedTextBlockId) || null;

  useEffect(() => {
    if (!org?.slug) return;

    const projectId = scope === 'project' ? selectedProject?.id : undefined;

    dispatch(
      fetchTextBlocks({
        page: 1,
        limit: 100,
        searchTerm: '',
        orgSlug: org.slug,
        blockType: TextBlockCategory.KNOWLEDGE,
        scope: scope === 'organization' ? 'organization_only' : 'project_only',
        projectId,
      }),
    )
      .unwrap()
      .catch((error) => {
        notification.error({
          message: 'Error Loading Knowledge Text Blocks',
          description: error.message || 'Failed to load text blocks.',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [dispatch, org, scope, selectedProject]);

  const handleSelectTextBlock = useCallback((textBlock: TextBlockType) => {
    setSelectedTextBlockId(textBlock.id);
    setIsCreatingNew(false);
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedTextBlockId(null);
    setIsCreatingNew(true);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    const filteredBlocks = textBlocks();
    if (filteredBlocks.length > 0) {
      setSelectedTextBlockId(filteredBlocks[0].id);
    } else {
      setSelectedTextBlockId(null);
    }
    setIsCreatingNew(false);
  }, [textBlocks]);

  const handleScopeChange = useCallback(
    (newScope: 'organization' | 'project') => {
      setScope(newScope);
      setSelectedTextBlockId(null);
      setIsCreatingNew(false);
    },
    [],
  );

  const handleCreateSuccess = useCallback((newBlock: TextBlockType) => {
    setSelectedTextBlockId(newBlock.id);
    setIsCreatingNew(false);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const projectId = selectedProject?.id;

  return (
    <div className={styles.confluenceLayout}>
      <TextBlockHeader
        scope={scope}
        onScopeChange={handleScopeChange}
        onSearch={handleSearch}
        onCreateNew={handleCreateNew}
        searchValue={searchValue}
      />

      <div className={styles.contentContainer}>
        <TextBlockSidebar
          textBlocks={textBlocks()}
          onSelectTextBlock={handleSelectTextBlock}
          selectedTextBlockId={selectedTextBlockId}
          searchValue={searchValue}
        />

        <TextBlockEditor
          textBlock={selectedTextBlock}
          onDeleteSuccess={handleDeleteSuccess}
          blockType={TextBlockCategory.KNOWLEDGE}
          onCreateSuccess={handleCreateSuccess}
          isCreatingNew={isCreatingNew}
          projectId={projectId}
          scope={scope}
          onCreateNew={handleCreateNew}
        />
      </div>
    </div>
  );
}
