import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { installExtensions } from './extensions';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';
import { AppUpdater } from './updater';

let mainWindow: BrowserWindow | null = null;

export async function createWindow() {
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string =>
    path.join(RESOURCES_PATH, ...paths);

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

  if (isDebug) {
    mainWindow.webContents.once('dom-ready', async () => {
      try {
        const {
          default: installExtension,
          REDUX_DEVTOOLS,
          REACT_DEVELOPER_TOOLS,
        } = await import('electron-devtools-installer');
        await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
        console.log('Extensions installed');
      } catch (error) {
        console.log('Error installing extensions:', error);
      }
    });
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

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  new AppUpdater();
}

export function getMainWindow() {
  return mainWindow;
}
