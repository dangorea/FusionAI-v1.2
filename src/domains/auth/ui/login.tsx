import { useEffect, useState } from 'react';
import { Button, message, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../../../lib/redux/hook';
import { setToken } from '../../../lib/redux/feature/auth/reducer';
import {
  base64UrlEncode,
  generateRandomString,
  sha256,
} from '../../../utils/auth';
import styles from './login-page.module.scss';
import { setAuthToken } from '../../../services/api';
import { setUser } from '../../../lib/redux/feature/user/reducer';
import { registerUser } from '../../../api/users';

import Logo from '../../../../assets/logo.svg';

const { Title } = Typography;

export default function Login() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const invitationToken = localStorage.getItem('invitation_token');
    if (invitationToken) {
      console.log('Invitation token present:', invitationToken);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setStatus('Redirecting to Auth0...');
      setLoading(true);

      const codeVerifier = generateRandomString(128);
      localStorage.setItem('pkce_code_verifier', codeVerifier);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64UrlEncode(hashed);
      const state = generateRandomString(16);
      const redirectUri = `${window.env.PROTOCOL_SCHEME}://auth/callback`;

      const authUrl =
        `https://${window.env.AUTH0_DOMAIN}/authorize?` +
        `response_type=code&` +
        `client_id=${window.env.AUTH0_CLIENT_ID}&` +
        `scope=${encodeURIComponent('openid profile email create:projects offline_access')}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `audience=${window.env.AUTH0_AUDIENCE}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256&` +
        `state=${state}&prompt=login`;

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await window.electron.ipcRenderer.invoke('openAuthWindow', authUrl);
      } else {
        await window.electron.ipcRenderer.openExternal(authUrl);
      }

      const authPromise = new Promise((resolve, reject) => {
        const listener = window.electron.ipcRenderer.onAuthCallback((code) => {
          window.electron.ipcRenderer.offAuthCallback(listener);
          resolve(code);
        });
        setTimeout(() => {
          window.electron.ipcRenderer.offAuthCallback(listener);
          reject(new Error('Authentication timeout'));
        }, 60000);
      });

      const code = await authPromise;
      setStatus('Exchanging token...');

      const tokenUrl = `https://${window.env.AUTH0_DOMAIN}/oauth/token`;
      const body = {
        grant_type: 'authorization_code',
        client_id: window.env.AUTH0_CLIENT_ID,
        code,
        scope: 'openid profile email create:projects offline_access',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        audience: window.env.AUTH0_AUDIENCE,
      };

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Token exchange error: ${response.status} ${errorData.error_description || ''}`,
        );
      }

      const tokenData = await response.json();
      const userRegisterResponse = await registerUser(tokenData);
      if (!userRegisterResponse) {
        throw new Error('Failed to register user');
      }

      dispatch(setUser(userRegisterResponse));
      localStorage.setItem('access_token', tokenData.access_token || '');
      if (tokenData.id_token) {
        localStorage.setItem('id_token', tokenData.id_token);
        dispatch(setToken(tokenData.id_token));
      }
      if (tokenData.refresh_token) {
        localStorage.setItem('refresh_token', tokenData.refresh_token);
      }
      localStorage.removeItem('pkce_code_verifier');

      dispatch(setToken(tokenData.access_token));
      setAuthToken(tokenData.access_token);
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      message.error('Authentication failed. Please try again.');
      setStatus(null);
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginCard}>
        <img src={Logo} alt="AngenAI Logo" className={styles.logo} />
        <Title level={2}>Welcome to AngenAI</Title>
        <p className={styles.statusText}>{status || null}</p>
        {loading && <Spin tip="Redirecting to Auth0, please wait..." />}
        {!loading && !status && (
          <Button
            type="primary"
            size="large"
            onClick={handleLogin}
            className={styles.buttonMargin}
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
}
