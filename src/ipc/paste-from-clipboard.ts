import { ipcMain, clipboard } from 'electron';

export function setupPasteFromClipboard() {
  ipcMain.handle('pasteFromClipboard', async () => {
    return {
      content: clipboard.readText(),
    };
  });
}
