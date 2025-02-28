import React, { useState } from 'react';
import { notification } from 'antd';
import { TextBlockModal, TextBlockTable } from '../../../components';
import styles from './TextBlocks.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import {
  addTextBlock,
  deleteTextBlock,
  editTextBlock,
} from '../../../lib/redux/feature/text-blocks/reducer';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { TextBlockDataType } from '../../../lib/redux/feature/text-blocks/types';

import {
  createTextBlock,
  deleteTextBlock as apiDeleteTextBlock,
  updateTextBlock,
} from '../../../api/textBlocks';

export function TextBlocks() {
  const dispatch = useAppDispatch();
  const textBlocks = useAppSelector((state) => {
    return state.textBlocks.ids.map((id) => state.textBlocks.entities[id]);
  });
  const org = useAppSelector(selectSelectedOrganizationEntity);

  const [selectedBlocks, setSelectedBlocks] = useState<TextBlockDataType[]>([]);
  const [isModalOpen] = useState(false);

  const handleAddTextBlock = async (
    newBlock: Omit<TextBlockDataType, 'id'>,
  ) => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      const createdBlock = await createTextBlock(org.slug, newBlock);
      dispatch(addTextBlock(createdBlock));
      notification.success({
        message: 'Rule Added',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Add Rule',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleEditTextBlock = async (updatedBlock: TextBlockDataType) => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      const response = await updateTextBlock(org.slug, updatedBlock);
      dispatch(editTextBlock(response));
      notification.success({
        message: 'Rule Updated',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Update Rule',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleDeleteTextBlock = async () => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      for (const block of selectedBlocks) {
        await apiDeleteTextBlock(org.slug, block.id);
        dispatch(deleteTextBlock(block.id));
      }
      notification.success({
        message: 'Selected Rules Deleted',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      setSelectedBlocks([]);
    } catch (error) {
      notification.error({
        message: 'Failed to Delete Selected Rules',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleSelectChange = (selectedIds: React.Key[]) => {
    const selectedItems = textBlocks.filter(
      (block) => block && selectedIds.includes(block.id),
    ) as TextBlockDataType[];
    setSelectedBlocks(selectedItems);
  };

  return (
    <div className={styles.componentRoot}>
      <TextBlockModal
        selectedBlocks={selectedBlocks}
        isModalOpen={isModalOpen}
        onAdd={handleAddTextBlock}
        onEdit={handleEditTextBlock}
        onDelete={handleDeleteTextBlock}
      />
      <TextBlockTable
        textBlocks={(textBlocks as TextBlockDataType[]).filter(Boolean)}
        onSelectChange={handleSelectChange}
      />
    </div>
  );
}
