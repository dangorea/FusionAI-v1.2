import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Button, message, Space, Tooltip, Typography } from 'antd';
import { useEffect } from 'react';
// import { setAuthToken } from '../../api/utils/axiosInstance';
import { CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoginButton = () => {
  const { loginWithPopup, isAuthenticated, user, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          // setAuthToken(token);
        } catch (error) {
          console.error('Failed to fetch token:', error);
        }
      }
    };

    fetchToken();
  }, [user, isAuthenticated, getAccessTokenSilently]);

  const handleCopyId = () => {
    if (user?.sub) {
      navigator.clipboard
        .writeText(user.sub)
        .then(() => {
          message.success('User ID copied to clipboard!');
        })
        .catch(() => {
          message.error('Failed to copy User ID');
        });
    }
  };

  if (!user) {
    return null;
  }

  return isAuthenticated ? (
    <Space>
      <Avatar src={user.picture} alt={user.name} />
      <Tooltip
        title={
          <Space>
            <Text>{user.sub}</Text>
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
          {user.name}
        </span>
      </Tooltip>
    </Space>
  ) : (
    <Button type="default" onClick={() => loginWithPopup()}>
      Sign In
    </Button>
  );
};

export default LoginButton;
