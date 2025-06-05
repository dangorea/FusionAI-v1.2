import React, { useEffect, useState } from 'react';
import { Button, notification, Space, Switch, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { MarkdownEditor } from '../../../../components';
import type {
  TextBlockCategory,
  TextBlockType,
} from '../../../../lib/redux/feature/text-blocks/types';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import {
  createTextBlockThunk,
  deleteTextBlockThunk,
  fetchTextBlocks,
  updateTextBlockThunk,
} from '../../../../lib/redux/feature/text-blocks/thunk';
import { NOTIFICATION_DURATION_SHORT } from '../../../../utils/notifications';
import { EditableTitle } from './EditableTitle';
import styles from './text-block-editor.module.scss';

const { Text } = Typography;

type Scope = 'organization' | 'project';

interface TextBlockEditorProps {
  textBlock: TextBlockType | null;
  onDeleteSuccess: () => void;
  blockType: TextBlockCategory;
  onCreateSuccess: (newBlock: TextBlockType) => void;
  isCreatingNew: boolean;
  scope: Scope;
  projectId?: string;
  onCreateNew?: () => void;
}

export function TextBlockEditor({
  textBlock,
  onDeleteSuccess,
  blockType,
  onCreateSuccess,
  isCreatingNew,
  scope,
  projectId,
  onCreateNew,
}: TextBlockEditorProps) {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [isModified, setIsModified] = useState(false);
  const initialScope: Scope =
    textBlock && textBlock.projectId ? 'project' : 'organization';
  const [scopeState, setScopeState] = useState<Scope>(initialScope);

  useEffect(() => {
    if (textBlock && !isCreatingNew) {
      setScopeState(textBlock.projectId ? 'project' : 'organization');
    } else if (isCreatingNew) {
      setScopeState(scope === 'project' ? 'project' : 'organization');
    }
  }, [textBlock, isCreatingNew, scope]);

  useEffect(() => {
    if (textBlock && !isCreatingNew) {
      setContent(textBlock.content);
      setName(textBlock.name);
      setIsModified(false);
    } else if (isCreatingNew) {
      setContent('');
      setName('');
      setIsModified(false);
    }
  }, [textBlock, isCreatingNew]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (textBlock && !isCreatingNew) {
      setIsModified(
        newContent !== textBlock.content ||
          name !== textBlock.name ||
          scopeState !== (textBlock.projectId ? 'project' : 'organization'),
      );
    } else {
      setIsModified(newContent.trim() !== '' && name.trim() !== '');
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (textBlock && !isCreatingNew) {
      setIsModified(
        content !== textBlock.content ||
          newName !== textBlock.name ||
          scopeState !== (textBlock.projectId ? 'project' : 'organization'),
      );
    } else {
      setIsModified(content.trim() !== '' && newName.trim() !== '');
    }
  };

  const handleScopeChange = (checked: boolean) => {
    const newScope: Scope = checked ? 'project' : 'organization';
    setScopeState(newScope);
    if (textBlock && !isCreatingNew) {
      const originalScope = textBlock.projectId ? 'project' : 'organization';
      setIsModified(
        content !== textBlock.content ||
          name !== textBlock.name ||
          newScope !== originalScope,
      );
    } else {
      setIsModified(content.trim() !== '' && name.trim() !== '');
    }
  };

  const refreshBlocks = () => {
    if (!org?.slug) return;
    dispatch(
      fetchTextBlocks({
        page: 1,
        limit: 100,
        searchTerm: '',
        orgSlug: org.slug,
        blockType,
        projectId: scopeState === 'project' ? projectId : undefined,
      }),
    )
      .unwrap()
      .catch(() => {});
  };

  const handleSave = async () => {
    if (!org?.slug) {
      notification.error({
        message: 'No organization selected',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      return;
    }

    const payload: any = {
      orgSlug: org.slug,
      newTextBlock: { name, content, type: blockType },
    };
    if (scopeState === 'project' && projectId) {
      payload.projectId = projectId;
    }

    if (isCreatingNew) {
      try {
        const newTextBlock = await dispatch(
          createTextBlockThunk(payload),
        ).unwrap();

        notification.success({
          message: 'New item created',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        onCreateSuccess(newTextBlock);
        refreshBlocks();
      } catch {
        notification.error({
          message: 'Failed to create new item',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      }
    } else if (textBlock) {
      try {
        const targetProjectId =
          scopeState === 'project' ? projectId : 'switch-to-organization';
        await dispatch(
          updateTextBlockThunk({
            orgSlug: org.slug,
            updatedTextBlock: {
              id: textBlock.id,
              name,
              content,
              type: textBlock.type,
              projectId: targetProjectId,
            },
          }),
        ).unwrap();

        notification.success({
          message: 'Item updated',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        setIsModified(false);
        refreshBlocks();
      } catch {
        notification.error({
          message: 'Failed to update item',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!org?.slug || !textBlock) {
      notification.error({
        message: 'No organization or item selected',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      return;
    }

    try {
      await dispatch(
        deleteTextBlockThunk({ orgSlug: org.slug, id: textBlock.id }),
      ).unwrap();
      notification.success({
        message: 'Item deleted',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      onDeleteSuccess();
      refreshBlocks();
    } catch {
      notification.error({
        message: 'Failed to delete item',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleCancel = () => {
    if (textBlock) {
      setName(textBlock.name);
      setContent(textBlock.content);
      setIsModified(false);
    } else {
      onDeleteSuccess();
    }
  };

  if (!textBlock && !isCreatingNew) {
    return (
      <div className={styles.editorContainer}>
        <div className={styles.emptyState}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() =>
              onCreateNew
                ? onCreateNew()
                : onCreateSuccess({
                    id: 'new',
                    name: '',
                    content: '',
                    type: blockType,
                  } as TextBlockType)
            }
          >
            Create New Item
          </Button>
          <Text className={styles.emptyStateText}>
            or select an item from the list
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <div className={styles.nameInputWrapper}>
          <EditableTitle
            value={name}
            onChange={handleNameChange}
            placeholder="Enter name..."
          />
        </div>
        <Space align="center">
          {isCreatingNew ? (
            <>
              <Button type="default" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!isModified}
              >
                Create
              </Button>
            </>
          ) : (
            <>
              <Text>Organization</Text>
              <Switch
                checked={scopeState === 'project'}
                onChange={handleScopeChange}
                disabled={!projectId}
              />
              <Text>Project</Text>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!isModified}
              >
                Update
              </Button>
              <Button icon={<DeleteOutlined />} onClick={handleDelete} />
            </>
          )}
        </Space>
      </div>
      <div className={styles.editorContent}>
        <MarkdownEditor value={content} onChange={handleContentChange} />
      </div>
    </div>
  );
}
