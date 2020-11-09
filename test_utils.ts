import {
  assert,
  assertObjectMatch,
  BufReader,
  BufWriter,
  decode,
  deferred,
  encode,
  path,
  TextProtoReader,
} from "./deps.ts";
import type { NotificationMessage, RequestMessage } from "./protocol.ts";

const CLI_PATH = path.join(
  path.dirname(path.fromFileUrl(import.meta.url)),
  "cli.ts",
);

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

interface LSP {
  stdin: Deno.Writer;
  stdout: Deno.Reader;
  projectRoot: string;
  nextID(): number;
}

interface TestDefinition {
  projectRoot: string;
  name: string;
  fn(lsp: LSP): Promise<void>;
}

export function testLSP(t: TestDefinition): void {
  const { projectRoot, name, fn } = t;
  Deno.test(
    `[LSP] ${name}`,
    withTimeout(20 * 1000, async () => {
      const cli = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          "--quiet",
          CLI_PATH,
        ],
        cwd: projectRoot,
        stdout: "piped",
        stdin: "piped",
      });
      try {
        let seqID = 0;
        const lsp = {
          stdin: cli.stdin,
          stdout: cli.stdout,
          projectRoot,
          nextID: () => ++seqID,
        } as LSP;
        await initializeLSP(lsp);
        await fn(lsp);
      } finally {
        cli.stdin.close();
        cli.stdout.close();
        cli.close();
      }
    }),
  );
}

async function initializeLSP(lsp: LSP): Promise<void> {
  const { stdin, stdout, projectRoot } = lsp;
  const nextID = lsp.nextID();
  sendMessage(stdin, {
    "id": nextID,
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "rootUri": path.toFileUrl(projectRoot).href,
      "capabilities": {
        "workspace": { "configuration": true, "applyEdit": true },
        "textDocument": {
          "implementation": { "linkSupport": true },
          "documentSymbol": {
            "symbolKind": {
              "valueSet": [
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
              ],
            },
            "hierarchicalDocumentSymbolSupport": false,
          },
          "semanticHighlightingCapabilities": {
            "semanticHighlighting": false,
          },
          "codeAction": {
            "codeActionLiteralSupport": {
              "codeActionKind": {
                "valueSet": [
                  "",
                  "quickfix",
                  "refactor",
                  "refactor.extract",
                  "refactor.inline",
                  "refactor.rewrite",
                  "source",
                  "source.organizeImports",
                ],
              },
            },
            "dynamicRegistration": false,
          },
          "completion": {
            "completionItem": {
              "snippetSupport": false,
              "documentationFormat": ["plaintext"],
            },
            "completionItemKind": {
              "valueSet": [
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
              ],
            },
          },
          "foldingRange": { "lineFoldingOnly": true },
          "typeDefinition": { "linkSupport": true },
          "typeHierarchy": false,
          "declaration": { "linkSupport": true },
          "definition": { "linkSupport": true },
        },
      },
      "rootPath": projectRoot,
      "processId": Deno.pid,
      "trace": "off",
    },
  });

  const initializeResult = await readResponse(stdout);
  assertObjectMatch(initializeResult, {
    jsonrpc: "2.0",
    id: nextID,
    result: {
      serverInfo: { name: "deno-lsp" },
    },
  });
}

function withTimeout(
  timeoutInMS: number,
  fn: () => Promise<void>,
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
