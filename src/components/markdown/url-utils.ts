/** Use Electron’s shell when available, otherwise fall back to window.open. */
export const openExternal: (url: string) => void =
  window?.electron?.ipcRenderer?.openExternal ??
  ((url) => window.open(url, '_blank', 'noopener,noreferrer'));

/** Add protocol if the user typed a bare domain (example.com → https://example.com). */
export const absolutize = (u: string): string => {
  const url = u.trim();
  if (!url) return url;
  if (/^[a-z][a-z0-9+.+-]*:\/\//i.test(url) || url.startsWith('#')) return url;
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../'))
    return url;
  return `https://${url}`;
};

/** Loose but pragmatic URL validator, identical to what the original file used. */
export const isValidUrl = (u: string): boolean => {
  const url = u.trim();

  if (
    !url ||
    url.startsWith('#') ||
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('../')
  )
    return true;

  try {
    const parsed = new URL(absolutize(url));
    if (!/^https?:$/.test(parsed.protocol)) return false;

    const host = parsed.hostname;
    const hostLooksOkay =
      host === 'localhost' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || // IPv4
      /^\[[0-9a-fA-F:]+\]$/.test(host) || // IPv6
      host.includes('.'); // something like example.com

    return hostLooksOkay;
  } catch {
    return false;
  }
};
