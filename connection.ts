import { assert, BufReader, BufWriter, decode, encode } from "./deps.ts";
import { TextProtoReader } from "./deps.ts";
import type {
  NotificationMessage,
  RequestMessage,
  ResponseErrorData,
  ResponseMessage,
  ResponseResult,
} from "./protocol.ts";
import { readRequestMessage, writeResponseMessage } from "./io.ts";

export class Request {
  #w: BufWriter;

  constructor(
    w: BufWriter,
    readonly message: RequestMessage | NotificationMessage,
  ) {
    this.#w = w;
  }

  respond(result: ResponseResult): Promise<void> {
    assert("id" in this.message, "must not respond to NotificationMessage");
    const { id, jsonrpc } = this.message as RequestMessage;
    return this.writeResponseMessage({
      jsonrpc,
      id,
      result,
    });
  }

  respondError(
    code: number,
    message: string,
    data?: ResponseErrorData,
  ): Promise<void> {
    assert("id" in this.message, "must not respond to NotificationMessage");
    const { id, jsonrpc } = this.message as RequestMessage;
    return this.writeResponseMessage({
      id,
      jsonrpc,
      error: { code, message, data },
    });
  }

  private writeResponseMessage(message: ResponseMessage): Promise<void> {
    return writeResponseMessage(this.#w, message);
  }
}

export class Connection implements AsyncIterable<Request>, Deno.Closer {
  #r: Deno.Reader & Deno.Closer;
  #w: Deno.Writer & Deno.Closer;
  #bufReader: BufReader;
  #bufWriter: BufWriter;
  #decoder = new TextDecoder();

  constructor(
    r: Deno.Reader & Deno.Closer,
    w: Deno.Writer & Deno.Closer,
  ) {
    this.#r = r;
    this.#w = w;
    this.#bufReader = BufReader.create(r);
    this.#bufWriter = BufWriter.create(w);
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Request> {
    while (true) {
      const message = await readRequestMessage(this.#bufReader);
      if (message === null) {
        break;
      }
      const request = new Request(this.#bufWriter, message);
      yield request;
    }
  }

  close() {
    this.#r.close();
    this.#w.close();
  }
}
