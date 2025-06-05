import type Electron from 'electron';
import { BrowserWindow } from 'electron';
import { getMainWindow } from './window';

const SCHEME =
  process.env.PROTOCOL_SCHEME ||
  (process.env.APP_CHANNEL === 'beta' ? 'angenai-beta' : 'angenai');

let authWindowRef: BrowserWindow | null = null;

export function handleDeepLink(url: string) {
  console.log('Deep link received:', url);
  try {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get('code');
    const token = parsedUrl.searchParams.get('token');
    const mainWindow = getMainWindow();

    if (!mainWindow) {
      console.error('Main window is not available');
      return;
    }

    const sendEvent = (channel: 'auth-callback', data: string) => {
      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once('did-finish-load', () => {
          console.log(`Sending ${channel} after did-finish-load:`, data);
          mainWindow.webContents.send(channel, data);
        });
      } else {
        console.log(`Sending ${channel} immediately:`, data);
        mainWindow.webContents.send(channel, data);
      }
    };

    if (code) {
      sendEvent('auth-callback', code);

      if (authWindowRef && !authWindowRef.isDestroyed()) {
        authWindowRef.close();
        authWindowRef = null;
      }
    } else if (token) {
      console.log('Invitation token received:', token);

      localStorage.setItem('invitation_token', token);
      mainWindow.webContents.executeJavaScript(
        `localStorage.setItem("invitation_token", "${token}")`,
      );
    } else {
      console.log('Deep link did not contain an auth code or token:', url);
    }
  } catch (err) {
    console.error('Failed to parse deep link URL:', err);
  }
}

export function openAuthWindow(authUrl: string): void {
  const mainWindow = getMainWindow();
  if (!mainWindow) {
    console.error('Main window not available');
    return;
  }

  const authWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  authWindowRef = authWindow;
  authWindow.on('closed', () => {
    authWindowRef = null;
  });

  const forwardCode = (_event: Electron.Event, url: string) => {
    if (url.startsWith(`${SCHEME}://auth/callback`)) {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      if (code && !mainWindow.webContents.isLoading()) {
        mainWindow.webContents.send('auth-callback', code);
        authWindow.close();
      }
    }
  };

  authWindow.webContents.on('will-redirect', forwardCode);
  authWindow.webContents.on('will-navigate', forwardCode);

  authWindow.loadURL(authUrl);
}
