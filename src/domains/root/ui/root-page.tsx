import React, { ReactNode, useState } from 'react';
import { Navigate } from 'react-router';
import { Space, Spin } from 'antd';
import { useAppSelector } from '../../../lib/redux/hook';
import { getToken } from '../../../lib/redux/feature/auth/selectors';

type Props = { children: ReactNode };

export function Root({ children }: Props) {
  const token = useAppSelector(getToken);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <Space
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </Space>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}
