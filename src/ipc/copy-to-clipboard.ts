import { ipcMain, clipboard } from 'electron';

export function setupCopyToClipboard() {
  ipcMain.handle('copyToClipboard', async (_, contents: string) => {
    clipboard.writeText(contents);
  });
}
