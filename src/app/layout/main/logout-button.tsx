import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { clearToken } from '../../../lib/redux/feature/auth/reducer';
import index from '../../../services/api';
import { getToken } from '../../../lib/redux/feature/auth/selectors';
import { clearUser } from '../../../lib/redux/feature/user/reducer';

function LogoutButton() {
  const token = useAppSelector(getToken);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
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
  };

  if (!token) return null;

  return (
    <Button type="default" onClick={handleLogout}>
      Sign Out
    </Button>
  );
}

export default LogoutButton;
