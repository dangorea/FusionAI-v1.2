import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import styles from './style.module.scss';

type Props = {
  children: ReactNode;
  title: string;
  selectedItems: any[];
  onDelete: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
};

function CommonToolbar({
  children,
  title,
  selectedItems,
  onDelete,
  open,
  setOpen,
}: Props) {
  const isAddDisabled = useMemo(
    () => selectedItems.length > 0,
    [selectedItems],
  );
  const isEditDisabled = useMemo(
    () => selectedItems.length !== 1,
    [selectedItems],
  );
  const isDeleteDisabled = useMemo(
    () => selectedItems.length === 0,
    [selectedItems],
  );

  return (
    <div className={styles['toolbar-container']}>
      <Button
        onClick={() => setOpen(true)}
        icon={(<PlusOutlined />) as ReactNode}
        type="text"
        disabled={isAddDisabled}
      />
      <Button
        type="text"
        icon={(<EditOutlined />) as ReactNode}
        onClick={() => {
          if (selectedItems.length) setOpen(true);
        }}
        disabled={isEditDisabled}
      />
      <Button
        type="text"
        icon={(<DeleteOutlined />) as ReactNode}
        onClick={onDelete}
        disabled={isDeleteDisabled}
      />

      <Modal
        title={title}
        centered
        open={open}
        onCancel={() => setOpen(false)}
        width={1000}
        footer={null}
        maskClosable={false}
        styles={{
          header: { margin: 0, paddingBottom: '18px' },
        }}
      >
        {children}
      </Modal>
    </div>
  );
}

export { CommonToolbar };
