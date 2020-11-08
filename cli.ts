import { Connection } from "./connection.ts";
import { Server } from "./server.ts";
import { createLogger } from "./logger.ts";
import { BufWriter, encode, log } from "./deps.ts";

async function createServer(): Promise<Server> {
  const logger = await createLogger();
  const conn = new Connection(Deno.stdin, Deno.stdout);
  const server = new Server(
    conn,
    logger,
  );
  return server;
}

function cleanup() {
  flushLogs();
}

function flushLogs() {
  for (const handler of log.getLogger().handlers) {
    if (handler instanceof log.handlers.FileHandler) {
      handler.flush();
    }
  }
}

async function main() {
  const server = await createServer();

  setInterval(() => {
    flushLogs();
  }, 3 * 1000);

  try {
    await Promise.race([
      server.listen(),
      server.done,
    ]);
    cleanup();
    Deno.exit(0);
  } catch {
    cleanup();
    Deno.exit(1);
  }
}

main();
