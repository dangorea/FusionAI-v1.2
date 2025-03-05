import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example' | 'openExternal' | 'auth-callback';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    openExternal: (url: string) => ipcRenderer.invoke('openExternal', url),
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    onAuthCallback(callback: (code: string) => void) {
      const listener = (_event: IpcRendererEvent, code: string) => {
        console.log(code);
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

contextBridge.exposeInMainWorld('env', {
  BASE_URL: process.env.BASE_URL,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  ELECTRON_START_URL: process.env.ELECTRON_START_URL,
});

export type ElectronHandler = typeof electronHandler;
