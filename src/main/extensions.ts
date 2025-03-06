const installExtension = require('electron-devtools-installer');

export async function installExtensions() {
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];
  try {
    return await installExtension.default(
      extensions.map((name: string) => installExtension[name]),
      forceDownload,
    );
  } catch (error) {
    console.log('Error installing extensions:', error);
  }
}
