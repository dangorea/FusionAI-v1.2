import React from 'react';
import { RouterProvider } from 'react-router';
import { useIndexedDB } from '../database';
import StoreProvider from '../provider/StoreProvider';
import router from '../app/router';
import './App.module.scss';
import { AuthProvider } from '../provider/AuthProvider';

// <Auth0Provider
//       domain={window.env.AUTH0_DOMAIN}
//       clientId={window.env.AUTH0_CLIENT_ID}
//       authorizationParams={{
//         redirect_uri: `${window.location.origin}/main_window`,
//         audience: window.env.AUTH0_AUDIENCE,
//         scope: 'openid profile email create:projects',
//       }}
//       cacheLocation="localstorage"
//       onRedirectCallback={(appState) => {
//         window.location.href = appState?.returnTo || '/login';
//       }}
//     > </Auth0Provider>

export default function App() {
  useIndexedDB();

  return (
    <StoreProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StoreProvider>
  );
}
