import React, { useCallback } from 'react';
import { Avatar, Dropdown, Typography, message } from 'antd';
import { LogoutOutlined, CopyOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import { selectCurrentUser } from '../../lib/redux/feature/user/selectors';
import style from './style.module.scss';
import { clearToken } from '../../lib/redux/feature/auth/reducer';
import { clearUser } from '../../lib/redux/feature/user/reducer';
import index from '../../services/api';

const { Text } = Typography;

function UserAvatarMenu() {
  // Get the current user from Redux
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    dispatch(clearToken());
    dispatch(clearUser());
    delete index.defaults.headers.common.Authorization;

    const domain = window.env.AUTH0_DOMAIN;
    const clientId = window.env.AUTH0_CLIENT_ID;
    const logoutUrl = `https://${domain}/v2/logout?federated=true&client_id=${clientId}&returnTo=fusionai://auth/callback`;

    try {
      const response = await fetch(logoutUrl);
      console.log('Logout response:', response);
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const handleCopyId = useCallback(() => {
    if (user?.auth0Id) {
      navigator.clipboard
        .writeText(user.auth0Id)
        .then(() => {
          // Use Ant Design message API for notifications (imported where this function is actually used)
          message.success('User ID copied to clipboard!');
        })
        .catch(() => {
          message.error('Failed to copy User ID');
        });
    }
  }, [user]);

  // Define dropdown menu items
  const items = [
    {
      key: 'user-info',
      label: (
        <div className={style.userInfoItem}>
          <div className={style.userName}>{user?.fullName || 'User'}</div>
          <div className={style.userEmail} onClick={handleCopyId}>
            <span>{user?.email}</span>
            <CopyOutlined className={style.copyIcon} />
          </div>
        </div>
      ),
      type: 'group',
    },
    { type: 'divider' },
    // {
    //   key: 'profile',
    //   icon: <UserOutlined />,
    //   label: 'My Profile',
    //   onClick: () => navigate('/profile'),
    // },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName={style.profileDropdown}
    >
      <Avatar
        src={user?.profilePicture}
        icon={!user?.profilePicture && <UserOutlined />}
        alt={user?.fullName}
        className={style.userAvatar}
        size={34}
      />
    </Dropdown>
  );
}

export default UserAvatarMenu;
