import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Layout, Typography } from 'antd';
import { Navigate } from 'react-router';

const { Title } = Typography;
const { Content } = Layout;

export default function Login() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  console.log('test');

  const handleLogin = async () => {
    await loginWithRedirect();
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Welcome to FusionAI</Title>
          <Button type="primary" onClick={handleLogin}>
            Log in / Sign up
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
