export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

export function normalizePathsInResponse<T>(response: T): T {
  const normalize = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(normalize);
    } else if (obj && typeof obj === 'object') {
      const normalizedObj: any = {};
      for (const key of Object.keys(obj)) {
        if (key === 'path') {
          normalizedObj[key] = normalizePath(obj[key]);
        } else {
          normalizedObj[key] = normalize(obj[key]);
        }
      }
      return normalizedObj;
    }
    return obj;
  };

  return normalize(response);
}
