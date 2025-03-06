import React from 'react';
import { RouterProvider } from 'react-router';
import { useIndexedDB } from '../database';
import StoreProvider from '../provider/StoreProvider';
import router from '../app/router';
import './App.module.scss';
import { AuthProvider } from '../provider/AuthProvider';
import 'antd/dist/reset.css';
import { notification, unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

import '@ant-design/v5-patch-for-react-19';
import { ThemeProvider } from '../provider/theme-provider';

export default function App() {
  const [, contextHolder] = notification.useNotification();
  useIndexedDB();

  // TODO: use the following root creation mechanism till next Antd (actual: 5.24.3) next major update that will support React: 19.0.0
  unstableSetRender((node, container) => {
    (container as Element)._reactRoot ||= createRoot(container);
    const root = (container as Element)._reactRoot;
    root.render(node);
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      root.unmount();
    };
  });

  return (
    <StoreProvider>
      <AuthProvider>
        <ThemeProvider>
          {contextHolder}
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
