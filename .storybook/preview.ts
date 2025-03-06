import type { Preview } from '@storybook/react';

if (!(window as any).fileAPI) {
  (window as any).fileAPI = {
    getFileTree: async (rootPath: string) => {
      return {
        name: 'root',
        path: rootPath,
        children: [],
      };
    },
    watchDirectory: (rootPath: string) => {
      console.log(`Mock watchDirectory called for ${rootPath}`);
    },
  };
}

if (!(window as any).electron) {
  (window as any).electron = {
    ipcRenderer: {
      on: (channel: string, listener: (...args: any[]) => void) => {
        console.log(`Mock ipcRenderer on called for ${channel}`);
        return () => {
          console.log(`Unsubscribed from ${channel}`);
        };
      },
    },
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
