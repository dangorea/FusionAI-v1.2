import { app, protocol } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import { createWindow, getMainWindow } from './window';
import { handleDeepLink } from './auth';
import './ipcHandlers';
import { AppUpdater } from './updater';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'production') {
  require('source-map-support').install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'fusionai', privileges: { bypassCSP: true } },
]);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', async () => {
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

  await createWindow();

  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }

  const deepLinkArg = process.argv.find((arg) => arg.startsWith('fusionai://'));
  if (deepLinkArg) {
    handleDeepLink(deepLinkArg);
  }

  new AppUpdater();
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
  const mainWindow = getMainWindow();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('activate', async () => {
  if (getMainWindow() === null) {
    await createWindow();
  }
});
