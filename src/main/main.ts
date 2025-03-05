/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as dotenv from 'dotenv';
import log from 'electron-log';
import { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function handleDeepLink(url: string) {
  console.log('Deep link received:', url);
  try {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get('code');
    if (code) {
      if (mainWindow && !mainWindow.webContents.isLoading()) {
        mainWindow.webContents.send('auth-callback', code);
      }
    }
  } catch (err) {
    console.error('Failed to parse deep link URL:', err);
  }
}

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('openAuthWindow', async (_event, authUrl: string) => {
  // Create a modal BrowserWindow as a child of the main window.
  const authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow || undefined,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  authWindow.loadURL(authUrl);

  // Listen for redirects to the callback URL to capture the auth code.
  authWindow.webContents.on('will-redirect', (event, url) => {
    if (url.startsWith('fusionai://auth/callback')) {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      if (code && mainWindow && !mainWindow.webContents.isLoading()) {
        mainWindow.webContents.send('auth-callback', code);
        authWindow.close();
      }
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
require('electron-debug')();
// }

protocol.registerSchemesAsPrivileged([
  { scheme: 'fusionai', privileges: { bypassCSP: true } },
]);

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name: string) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1600,
    height: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // if (isDebug) {
  mainWindow.webContents.once('dom-ready', async () => {
    await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  });
  // }

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  // mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  new AppUpdater();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    if (!app.isDefaultProtocolClient('fusionai')) {
      if (process.env.NODE_ENV === 'development') {
        const gotProtocol = app.setAsDefaultProtocolClient(
          'fusionai',
          process.execPath,
          [path.resolve(process.argv[1])],
        );
        console.log('Protocol registration in development:', gotProtocol);
      } else {
        app.setAsDefaultProtocolClient('fusionai');
      }
    }

    createWindow();

    if (mainWindow) {
      mainWindow.webContents.openDevTools();
    }

    const deepLinkArg = process.argv.find((arg) =>
      arg.startsWith('fusionai://'),
    );
    if (deepLinkArg) {
      handleDeepLink(deepLinkArg);
    }

    ipcMain.handle('openExternal', async (_event, url: string) => {
      await shell.openExternal(url);
    });

    app.on('open-url', (event, url) => {
      event.preventDefault();
      console.log('open-url event received:', url);
      handleDeepLink(url);
    });

    app.on('second-instance', (event, argv) => {
      const deepLinkUrl = argv.find((arg) => arg.startsWith('fusionai://'));
      if (deepLinkUrl) {
        console.log('second-instance deep link received:', deepLinkUrl);
        handleDeepLink(deepLinkUrl);
      }

      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });

    app.on('window-all-closed', () => {
      // Standard quit behavior
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
