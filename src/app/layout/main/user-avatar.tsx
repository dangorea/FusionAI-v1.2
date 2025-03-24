import React from 'react';
import { Avatar, message, Space, Tooltip, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../../lib/redux/hook';
import { selectCurrentUser } from '../../../lib/redux/feature/user/selectors';

const { Text } = Typography;

function UserAvatar() {
  // Get the current user from Redux
  const user = useAppSelector(selectCurrentUser);

  const handleCopyId = () => {
    if (user?.auth0Id) {
      navigator.clipboard
        .writeText(user.auth0Id)
        .then(() => {
          message.success('User ID copied to clipboard!');
        })
        .catch(() => {
          message.error('Failed to copy User ID');
        });
    }
  };

  return (
    <Space>
      <Avatar src={user?.profilePicture} alt={user?.fullName} />
      <Tooltip
        title={
          <Space>
            <Text>{user?.email}</Text>
            <CopyOutlined
              onClick={handleCopyId}
              style={{ cursor: 'pointer', color: 'gray' }}
            />
          </Space>
        }
        overlayInnerStyle={{
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          minWidth: '200px',
        }}
      >
        <span style={{ marginRight: '5px', cursor: 'pointer' }}>
          {user?.fullName}
        </span>
      </Tooltip>
    </Space>
  );
}

export default UserAvatar;
