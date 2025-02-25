import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router';
import { Space, Spin } from 'antd';
import AppLayout from '../../layout/app-layout';

function Root() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Space
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </Space>
    );
  }

  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" />;
}

export default Root;
