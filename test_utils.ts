import {
  assert,
  BufReader,
  BufWriter,
  decode,
  deferred,
  encode,
  TextProtoReader,
} from "./deps.ts";
import type { NotificationMessage, RequestMessage } from "./protocol.ts";

export async function sendMessage(
  w: Deno.Writer,
  message: RequestMessage | NotificationMessage,
): Promise<void> {
  const CRLF = "\r\n";
  const content = encode(JSON.stringify(message));
  const bufw = BufWriter.create(w);
  await bufw.write(encode(`Content-Length: ${content.length}${CRLF}`));
  await bufw.write(encode(CRLF));
  await bufw.write(content);
  await bufw.flush();
}

export async function readResponse(
  r: Deno.Reader,
): Promise<Record<string, unknown>> {
  const bufr = BufReader.create(r);
  const tp = new TextProtoReader(bufr);
  const headers = await tp.readMIMEHeader();
  assert(headers, "Unexpected eof");
  const contentLength = headers.get("Content-Length");
  assert(contentLength, "Malformed response");
  const buf = new Uint8Array(parseInt(contentLength));
  assert(await bufr.readFull(buf), "Unexpected eof");
  return JSON.parse(decode(buf));
}

export function withTimeout(
  fn: () => Promise<void>,
  timeoutInMS: number,
): () => Promise<void> {
  return () => {
    const timeoutPromise = deferred<void>();
    const timeout = setTimeout(() => {
      timeoutPromise.reject(new Error("Timeout"));
    }, timeoutInMS);
    return Promise.race([
      fn(),
      timeoutPromise,
    ]).finally(() => {
      clearTimeout(timeout);
    });
  };
}
