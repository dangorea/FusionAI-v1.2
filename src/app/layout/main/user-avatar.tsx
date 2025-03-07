import { Avatar, message, Space, Tooltip, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';
import type { User } from '@auth0/auth0-react';

const { Text } = Typography;

function UserAvatar() {
  const idToken = localStorage.getItem('id_token');
  const user = idToken ? (jwtDecode(idToken) as User) : null;

  const handleCopyId = () => {
    if (user?.sub) {
      navigator.clipboard
        .writeText(user.sub)
        .then(() => {
          message.success('User ID copied to clipboard!');
          return true;
        })
        .catch(() => {
          message.error('Failed to copy User ID');
        });
    }
  };

  return (
    <Space>
      <Avatar src={user?.picture} alt={user?.name} />
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
          {user?.name}
        </span>
      </Tooltip>
    </Space>
  );
}

export default UserAvatar;
