import { dialog, ipcMain, shell } from 'electron';
import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import fs from 'fs';
import { getMainWindow } from './window';
import { openAuthWindow, silentTokenRenew } from './auth';
import {
  buildFileTreeFromMapping,
  getFileTree,
  mergeComparisonTrees,
} from './fileTree';
import WebContents = Electron.WebContents;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('openAuthWindow', async (_event, authUrl: string) => {
  openAuthWindow(authUrl);
});

ipcMain.handle('silentTokenRenew', async (_event, authUrl: string) => {
  return silentTokenRenew(authUrl);
});

ipcMain.handle('select-directory', async () => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }
  const directoryPath = result.filePaths[0];
  const fileTree = getFileTree(directoryPath);
  return { canceled: false, directoryPath, fileTree };
});

ipcMain.handle('set-project-path', async (_event, directoryPath: string) => {
  console.log('Project path set to:', directoryPath);
  return true;
});

ipcMain.handle('openExternal', async (_event, url: string) => {
  await shell.openExternal(url);
});

const fileWatchers: Record<
  string,
  { watcher: fs.FSWatcher; senders: WebContents[] }
> = {};

function createFileWatcher(filePath: string, sender: WebContents) {
  if (fileWatchers[filePath]) {
    const { senders } = fileWatchers[filePath];
    if (!senders.includes(sender)) {
      senders.push(sender);
    }
    return;
  }

  try {
    const watcher = fs.watch(filePath, { encoding: 'utf-8' }, (_eventType) => {
      let content = '';
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        console.error(`Failed to read file ${filePath} after change`, err);
      }

      fileWatchers[filePath].senders.forEach((wc) => {
        wc.send('file-changed', { filePath, content });
      });
    });

    fileWatchers[filePath] = {
      watcher,
      senders: [sender],
    };
  } catch (err) {
    console.error(`Failed to watch file: ${filePath}`, err);
  }
}

function removeFileWatcher(filePath: string, sender: Electron.WebContents) {
  const entry = fileWatchers[filePath];
  if (!entry) return;

  entry.senders = entry.senders.filter((wc) => wc !== sender);

  if (entry.senders.length === 0) {
    entry.watcher.close();
    delete fileWatchers[filePath];
  }
}

ipcMain.handle('get-file-tree', async (_event, rootPath: string) => {
  try {
    const tree = getFileTree(rootPath);
    return tree;
  } catch (error) {
    console.error('Error in get-file-tree IPC:', error);
    throw error;
  }
});

ipcMain.handle('read-file-content', async (_event, filePath: string) => {
  if (!filePath || filePath.trim() === '') {
    return '';
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return '';
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading file content:', filePath, error);
    return '';
  }
});

ipcMain.handle('watch-file', (event, filePath: string) => {
  const { sender } = event;
  createFileWatcher(filePath, sender);
});

ipcMain.handle('unwatch-file', (event, filePath: string) => {
  const { sender } = event;
  removeFileWatcher(filePath, sender);
});

let directoryWatcher: FSWatcher | null = null;

ipcMain.handle('watch-directory', async (_event, rootPath: string) => {
  try {
    if (directoryWatcher) {
      await directoryWatcher.close();
    }

    const ignoredPattern = new RegExp(
      `(^|[\\/\\\\])(?:${[...require('./fileTree').SKIP_DIRECTORIES].join('|')})([\\/\\\\]|$)`,
    );

    directoryWatcher = chokidar.watch(rootPath, {
      persistent: true,
      ignoreInitial: true,
      depth: Infinity,
      ignored: ignoredPattern,
      usePolling: true,
      interval: 1000,
    });

    // @ts-ignore
    directoryWatcher.on('error', (error: unknown) => {
      console.error('Chokidar watcher error:', error);
    });

    const sendUpdatedTree = () => {
      try {
        const updatedTree = getFileTree(rootPath, true);
        const mainWindow = getMainWindow();
        if (mainWindow) {
          mainWindow.webContents.send('file-tree-updated', updatedTree);
        }
      } catch (error) {
        console.error('Error rebuilding file tree:', error);
      }
    };

    directoryWatcher
      // @ts-ignore
      .on('add', sendUpdatedTree)
      .on('addDir', sendUpdatedTree)
      .on('change', sendUpdatedTree)
      .on('unlink', sendUpdatedTree)
      .on('unlinkDir', sendUpdatedTree);

    return { success: true };
  } catch (error) {
    console.error('Error watching directory:', error);
    throw error;
  }
});

ipcMain.handle(
  'write-file-content',
  async (_event, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing file content:', filePath, error);
      throw error;
    }
  },
);

ipcMain.handle(
  'build-generated-file-tree',
  async (_event, mapping, projectPath) => {
    return buildFileTreeFromMapping(mapping, projectPath);
  },
);

ipcMain.handle('merge-file-trees', async (_event, baseTree, compareTree) => {
  return mergeComparisonTrees(baseTree, compareTree);
});
