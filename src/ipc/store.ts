const globalStore = {
  projectRoot: '' as string,
};

export function setProjectRoot(path: string) {
  globalStore.projectRoot = path;
}

export function getProjectRoot(): string {
  return globalStore.projectRoot;
}
