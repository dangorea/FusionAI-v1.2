import type { ReactNode } from 'react';
import React from 'react';
import { ConfigProvider, theme } from 'antd';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          // @ts-ignore
          colorTitle: '#555555',
          colorText: '#232323',
          colorDivider: '#cccccc',
          colorItemBackground: '#ffffff',
          colorBackground: '#fafafa',
          colorItemHover: '#f0f0f0',
          colorIconHover: '#e3f1ff',
          colorPrimary: '#1677ff',
          borderRadius: 4,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
