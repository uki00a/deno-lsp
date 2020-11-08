import {
  BufReader,
  BufWriter,
  decode,
  encode,
  TextProtoReader,
} from "./deps.ts";
import type {
  NotificationMessage,
  RequestMessage,
  ResponseMessage,
} from "./protocol.ts";

export async function readRequestMessage(
  r: BufReader,
): Promise<RequestMessage | NotificationMessage | null> {
  if (await r.peek(1) === null) {
    return null;
  }
  const tp = new TextProtoReader(r);
  const headers = await tp.readMIMEHeader();
  if (headers === null) {
    throw new Deno.errors.UnexpectedEof();
  }
  const contentLength = headers.get("Content-Length");
  const contentType = headers.get("Content-Type");
  if (contentLength === null) {
    throw new Deno.errors.UnexpectedEof("Missing Content-Length header");
  }
  const buf = new Uint8Array(parseInt(contentLength));
  if (await r.readFull(buf) === null) {
    throw new Deno.errors.UnexpectedEof();
  }
  return parseRequestMessage(buf);
}

export async function writeResponseMessage(
  w: BufWriter,
  message: ResponseMessage,
): Promise<void> {
  const CRLF = "\r\n";
  const payload = JSON.stringify(message);
  const contentLength = payload.length;
  await w.write(encode(`Content-Length: ${contentLength}${CRLF}`));
  await w.write(
    encode(`Content-Type: application/vscode-jsonrpc; charset=utf-8${CRLF}`),
  );
  await w.write(encode(CRLF));
  await w.write(encode(payload));
  await w.flush();
}

function parseRequestMessage(
  data: Uint8Array,
): RequestMessage | NotificationMessage {
  return JSON.parse(decode(data));
}
