import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

export async function installExtensions() {
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  try {
    await Promise.all([
      installExtension(REACT_DEVELOPER_TOOLS, { forceDownload }),
      installExtension(REDUX_DEVTOOLS, { forceDownload }),
    ]);
    console.log('Developer extensions installed successfully');
  } catch (error) {
    console.error('Error installing developer extensions:', error);
  }
}
