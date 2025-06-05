export function trimMiddle(path: string, maxLength: number): string {
  if (path.length <= maxLength) return path;
  const ellipsis = '...';
  const fileNameIndex = path.lastIndexOf('/');
  const fileName =
    fileNameIndex >= 0 ? path.substring(fileNameIndex + 1) : path;
  if (maxLength <= fileName.length + ellipsis.length) {
    return ellipsis + path.slice(-(maxLength - ellipsis.length));
  }
  const leftChars = maxLength - fileName.length - ellipsis.length;
  return path.substring(0, leftChars) + ellipsis + fileName;
}
