import { setupSelectDirectory } from './select-directory';
import { setupGetFilesContents } from './get-files-contents';
import { setupCopyToClipboard } from './copy-to-clipboard';
import { setupExecuteShellScript } from './execute-shell-script';
import { setupPasteFromClipboard } from './paste-from-clipboard';
import { setupSaveFileWithDynamicPath } from './download-gpt-file';
import { setupWatchDirectory } from './watch-directory';

export * from './types';

export function setupIPCHandlers() {
  setupSelectDirectory();
  setupGetFilesContents();
  setupCopyToClipboard();
  setupPasteFromClipboard();
  setupExecuteShellScript();
  setupSaveFileWithDynamicPath();
  setupWatchDirectory();
}
