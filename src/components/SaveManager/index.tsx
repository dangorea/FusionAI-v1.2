import React, { useState } from 'react';
import { List, Button, notification } from 'antd';
import { GptFileTreeNode } from '../../state/types';
import { NOTIFICATION_DURATION_LONG } from '../../utils/notifications';

interface SaveManagerProps {
  files: GptFileTreeNode[];
}

export const SaveManager: React.FC<SaveManagerProps> = ({ files }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const file of files) {
        const { path, content } = file;
        if (path && content) {
          await window.api.saveFile(path, content);
        }
      }
      notification.success({
        message: 'Save Complete',
        description: `Successfully saved ${files.length} file(s).`,
        duration: NOTIFICATION_DURATION_LONG,
      });
    } catch (error) {
      notification.error({
        message: 'Save Failed',
        description: 'An error occurred while saving files. Please try again.',
        duration: NOTIFICATION_DURATION_LONG,
      });
      console.error('Error saving files:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h3>Files to Save</h3>
      <List
        dataSource={files}
        renderItem={(file) => <List.Item>{file.name}</List.Item>}
      />
      <Button
        type="primary"
        onClick={handleSave}
        disabled={files.length === 0 || isSaving}
        loading={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save All'}
      </Button>
    </div>
  );
};
