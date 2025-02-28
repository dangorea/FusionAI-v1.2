import { ipcMain } from 'electron';
import { ExecuteShellScriptResult } from './types';
import { exec } from 'child_process';
import os from 'os';

export function setupExecuteShellScript() {
  ipcMain.handle(
    'executeShellScript',
    async (
      _,
      script: string,
      directory: string,
    ): Promise<ExecuteShellScriptResult> => {
      return new Promise((resolve) => {
        exec(script, { cwd: directory }, (error, stdout, stderr) => {
          if (error) {
            resolve({
              success: false,
              error: error.message,
              stdout,
              stderr,
            });
          } else {
            resolve({
              success: true,
              stdout,
              stderr,
            });
          }
        });
      });
    },
  );
}
