import { RouterProvider } from 'react-router';
import './App.module.scss';
import { Auth0Provider } from '@auth0/auth0-react';
import StoreProvider from '../provider/StoreProvider';
import router from '../constants/routes';

export default function App() {
  return (
    <Auth0Provider
      domain={window.env.AUTH0_DOMAIN}
      clientId={window.env.AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/main_window`,
        audience: window.env.AUTH0_AUDIENCE,
        scope: 'openid profile email create:projects',
      }}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        window.location.href = appState?.returnTo || '/login';
      }}
    >
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </Auth0Provider>
  );
}
