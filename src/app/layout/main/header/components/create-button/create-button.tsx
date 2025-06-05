import { PlusOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import style from './style.module.scss';

type Props = {
  onCreateWorkItem: () => void;
};

export function CreateButton({ onCreateWorkItem }: Props) {
  const items = [
    {
      key: 'workItem',
      label: 'Create Work Item',
      onClick: onCreateWorkItem,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <div className={style['icon-container']}>
        <PlusOutlined className={style.icon} />
      </div>
    </Dropdown>
  );
}
