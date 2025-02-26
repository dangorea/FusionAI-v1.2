import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router';
import { Space, Spin } from 'antd';
import AppLayout from '../../layout/app-layout';
import { OrganizationApiEndpoint } from '../../api/organization/endpoints';

function Root() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const get = async () => {
    const token = await getAccessTokenSilently();
    const orgs = await OrganizationApiEndpoint.getAllOrganizations(token);
    return orgs;
  };

  console.log(get());

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
