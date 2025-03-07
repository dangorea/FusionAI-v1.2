import React, { useState } from 'react';
import { notification } from 'antd';
import { TextBlockModal, TextBlockTable } from '../components';
import styles from './rules.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import {
  addRule,
  deleteRule,
  editRule,
} from '../../../lib/redux/feature/rules/reducer';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import type { RuleType } from '../../../lib/redux/feature/rules/types';
import {
  createTextBlock,
  deleteTextBlock as apiDeleteTextBlock,
  updateTextBlock,
} from '../../../api/text-blocks';

export function Rules() {
  const dispatch = useAppDispatch();
  const textBlocks = useAppSelector((state) => {
    return state.rules.ids.map((id) => state.rules.entities[id]);
  });
  const org = useAppSelector(selectSelectedOrganizationEntity);

  const [selectedBlocks, setSelectedBlocks] = useState<RuleType[]>([]);
  const [isModalOpen] = useState(false);

  const handleAddTextBlock = async (newBlock: Omit<RuleType, 'id'>) => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      const createdBlock = await createTextBlock(org.slug, newBlock);
      dispatch(addRule(createdBlock));
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

  const handleEditTextBlock = async (updatedBlock: RuleType) => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      const response = await updateTextBlock(org.slug, updatedBlock);
      dispatch(editRule(response));
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
      selectedBlocks.map(async (block) => {
        await apiDeleteTextBlock(org.slug, block.id);
        dispatch(deleteRule(block.id));
      });
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
    ) as RuleType[];
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
        textBlocks={(textBlocks as RuleType[]).filter(Boolean)}
        onSelectChange={handleSelectChange}
      />
    </div>
  );
}
