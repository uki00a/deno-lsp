import { log } from "./deps.ts";
import type { LogLevelName } from "./deps.ts";

export interface Logger {
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export async function createLogger(
  logLevel: LogLevelName = "DEBUG",
): Promise<Logger> {
  await log.setup({
    handlers: {
      file: new log.handlers.FileHandler(logLevel, {
        filename: "./deno-lsp.log",
        formatter(logRecord) {
          let msg = `[${logRecord.levelName}] ${logRecord.msg}`;
          for (const arg of logRecord.args) {
            try {
              msg += ` ${typeof arg === "object" ? JSON.stringify(arg) : arg}`;
            } catch {
              msg += ` ${arg}`;
            }
          }
          return msg;
        },
      }),
    },
    loggers: {
      default: {
        level: logLevel,
        handlers: ["file"],
      },
    },
  });
  const defaultLogger = log.getLogger();
  return {
    debug: defaultLogger.debug.bind(defaultLogger),
    info: defaultLogger.info.bind(defaultLogger),
    error: defaultLogger.error.bind(defaultLogger),
    warn: defaultLogger.warning.bind(defaultLogger),
  };
}
