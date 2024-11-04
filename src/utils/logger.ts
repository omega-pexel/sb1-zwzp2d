// Browser-compatible logging service
type LogLevel = 'info' | 'error' | 'warn';
type LogContext = Record<string, unknown>;

class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextString = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextString}`;
  }

  static info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('info', message, context);
    console.log(formattedMessage);
  }

  static error(error: unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorContext = {
      ...context,
      ...(error instanceof Error && { stack: error.stack }),
    };
    const formattedMessage = this.formatMessage('error', errorMessage, errorContext);
    console.error(formattedMessage);
  }

  static warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('warn', message, context);
    console.warn(formattedMessage);
  }
}

export const logError = (error: unknown, context?: LogContext): void => {
  Logger.error(error, context);
};

export const logInfo = (message: string, context?: LogContext): void => {
  Logger.info(message, context);
};

export const logWarn = (message: string, context?: LogContext): void => {
  Logger.warn(message, context);
};

export default Logger;