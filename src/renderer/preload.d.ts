import type { ElectronHandler } from '../main/preload';
import type { FileNode } from '../main/fileTree';

declare global {
  interface Element {
    _reactRoot?: any;
  }

  interface Window {
    electron: ElectronHandler;
    api: {
      selectDirectory: () => {
        canceled: boolean;
        directoryPath: string;
        fileTree: any;
      };
      setProjectPath: (path: string) => void;
    };
    fileAPI: {
      getFileTree: (rootPath: string) => Promise<any>;
      readFileContent: (filePath: string) => Promise<string>;
      watchFile: (filePath: string) => Promise<void>;
      writeFileContent: (filePath: string, content: string) => Promise<void>;
      unwatchFile: (filePath: string) => Promise<void>;
      watchDirectory: (rootPath: string) => Promise<void>;
      buildGeneratedFileTree: (
        mapping: any,
        rootPath: string,
      ) => Promise<FileNode>;
      mergeFileTrees: (baseTree: any, compareTree: any) => Promise<FileNode>;
      deleteFile: (path: string) => Promise<void>;
    };
    env: {
      BASE_URL: string;
      AUTH0_DOMAIN: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_AUDIENCE: string;
      PROTOCOL_SCHEME: string;
    };
  }
}

export {};
