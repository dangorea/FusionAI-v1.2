import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'openExternal'
  | 'auth-callback'
  | 'openAuthWindow'
  | 'file-changed'
  | 'file-tree-updated';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    openExternal: (url: string) => ipcRenderer.invoke('openExternal', url),
    invoke: (channel: Channels, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    onAuthCallback(callback: (code: string) => void) {
      const listener = (_event: IpcRendererEvent, code: string) => {
        callback(code);
      };
      ipcRenderer.on('auth-callback', listener);
      return listener;
    },
    offAuthCallback(listener: (...args: any[]) => void) {
      ipcRenderer.removeListener('auth-callback', listener);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => {
        func(...args);
      };
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

contextBridge.exposeInMainWorld('api', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  setProjectPath: (path: string) =>
    ipcRenderer.invoke('set-project-path', path),
});

contextBridge.exposeInMainWorld('fileAPI', {
  getFileTree: (rootPath: string) =>
    ipcRenderer.invoke('get-file-tree', rootPath),
  readFileContent: (filePath: string) =>
    ipcRenderer.invoke('read-file-content', filePath),
  writeFileContent: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file-content', filePath, content),
  watchFile: (filePath: string) => ipcRenderer.invoke('watch-file', filePath),
  unwatchFile: (filePath: string) =>
    ipcRenderer.invoke('unwatch-file', filePath),
  watchDirectory: (rootPath: string) =>
    ipcRenderer.invoke('watch-directory', rootPath),
  buildGeneratedFileTree: (mapping: any, projectPath: string) =>
    ipcRenderer.invoke('build-generated-file-tree', mapping, projectPath),
  mergeFileTrees: (baseTree: any, compareTree: any) =>
    ipcRenderer.invoke('merge-file-trees', baseTree, compareTree),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
});

contextBridge.exposeInMainWorld('env', {
  BASE_URL: process.env.BASE_URL,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  PROTOCOL_SCHEME: process.env.PROTOCOL_SCHEME,
});

export type ElectronHandler = typeof electronHandler;
