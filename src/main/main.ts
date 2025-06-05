import { app, protocol } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import { createWindow, getMainWindow } from './window';
import { handleDeepLink } from './auth';
import './ipcHandlers';
import { AppUpdater } from './updater';
import { installExtensions } from './extensions';

dotenv.config({
  path: app.isPackaged
    ? path.join(process.resourcesPath, 'env.production')
    : path.resolve(__dirname, '../../.env'),
});

const CHANNEL = process.env.APP_CHANNEL ?? 'stable';
const SCHEME =
  process.env.PROTOCOL_SCHEME ||
  (CHANNEL === 'beta' ? 'angenai-beta' : 'angenai');

app.setAppUserModelId(process.env.APP_ID!);
app.setPath(
  'userData',
  path.join(
    app.getPath('appData'),
    CHANNEL === 'beta' ? 'AngenAI Beta' : 'AngenAI',
  ),
);

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
  { scheme: SCHEME, privileges: { bypassCSP: true } },
]);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', (_event, argv) => {
  const deep = argv.find((a) => a.startsWith(`${SCHEME}://`));
  if (deep) handleDeepLink(deep);
  const win = getMainWindow();
  if (win) {
    win.isMinimized() ? win.restore() : win.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app
  .whenReady()
  .then(async () => {
    app.setAsDefaultProtocolClient(SCHEME);

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    await createWindow();

    const firstDeep = process.argv.find((a) => a.startsWith(`${SCHEME}://`));
    if (firstDeep) handleDeepLink(firstDeep);

    new AppUpdater();
  })
  .catch(console.error);

app.on('open-url', (evt, url) => {
  evt.preventDefault();
  handleDeepLink(url);
});

app.on('activate', async () => {
  if (getMainWindow() === null) await createWindow();
});
