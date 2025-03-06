import { BrowserWindow } from 'electron';
import { getMainWindow } from './window';

export function handleDeepLink(url: string) {
  console.log('Deep link received:', url);
  try {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get('code');
    const mainWindow = getMainWindow();
    if (code && mainWindow && !mainWindow.webContents.isLoading()) {
      mainWindow.webContents.send('auth-callback', code);
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
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  authWindow.loadURL(authUrl);
  authWindow.webContents.on('will-redirect', (event, url) => {
    if (url.startsWith('fusionai://auth/callback')) {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      if (code && !mainWindow.webContents.isLoading()) {
        mainWindow.webContents.send('auth-callback', code);
        authWindow.close();
      }
    }
  });
}

export function silentTokenRenew(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const silentWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
    silentWindow.loadURL(authUrl);
    silentWindow.webContents.on('will-redirect', (event, url) => {
      if (url.startsWith('fusionai://auth/callback')) {
        event.preventDefault();
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get('code');
        if (code) {
          resolve(code);
        } else {
          reject(new Error('No code found in callback URL'));
        }
        silentWindow.close();
      }
    });
    silentWindow.webContents.on(
      'did-fail-load',
      (event, errorCode, errorDescription) => {
        reject(
          new Error(
            `Silent authentication failed: ${errorDescription} (${errorCode})`,
          ),
        );
        silentWindow.close();
      },
    );
  });
}
