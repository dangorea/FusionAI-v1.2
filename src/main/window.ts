import { app, BrowserWindow, nativeImage, shell, Tray } from 'electron';

import path from 'path';
import { installExtensions } from './extensions';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';
import { AppUpdater } from './updater';

let mainWindow: BrowserWindow | null = null;
let tray: Tray;

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string =>
  path.join(RESOURCES_PATH, ...paths);

function createTray() {
  const baseIcon = nativeImage.createFromPath(getAssetPath('tray-icon.png'));
  const retinaBuffer = nativeImage
    .createFromPath(getAssetPath('tray-icon@2x.png'))
    .toPNG();

  baseIcon.addRepresentation({
    scaleFactor: 2,
    width: 16,
    height: 16,
    buffer: retinaBuffer,
  });

  tray = new Tray(baseIcon);
  tray.setToolTip('AngenAI');
}

export async function createWindow() {
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (process.platform === 'darwin') {
    // const dockIcon = nativeImage
    // .createFromPath(getAssetPath('icon.png'))
    // .resize({ width: 32, height: 32 });
    // app.dock.setIcon(dockIcon);
  }

  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1600,
    height: 900,
    minWidth: 750,
    minHeight: 700,
    // icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (mainWindow) {
    mainWindow.setVisibleOnAllWorkspaces(false);
  }

  mainWindow.loadURL(resolveHtmlPath('index.html'));

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

  // Build and set the application menu
  const menuBuilder = new MenuBuilder(mainWindow!);
  menuBuilder.buildMenu();

  // Create system tray icon
  // createTray();

  // Open links in the user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Set up auto-updates
  new AppUpdater();
}

/**
 * Get the main BrowserWindow instance.
 */
export function getMainWindow() {
  return mainWindow;
}
