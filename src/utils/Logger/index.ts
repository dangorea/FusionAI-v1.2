export class Logger {
  static info(message: string, ...optionalParams: unknown[]) {
    console.info(`[INFO] ${message}`, ...optionalParams);
  }

  static warn(message: string, ...optionalParams: unknown[]) {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  }

  static error(message: string, ...optionalParams: unknown[]) {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  }

  static debug(message: string, ...optionalParams: unknown[]) {
    console.debug(`[DEBUG] ${message}`, ...optionalParams);
  }
}
