import {
  assert,
  assertObjectMatch,
  assertStrictEquals,
  BufReader,
  BufWriter,
  decode,
  encode,
  TextProtoReader,
} from "./deps.ts";
import type { NotificationMessage, RequestMessage } from "./protocol.ts";

async function sendMessage(
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

Deno.test("integration test", async () => {
  let seqId = 0;
  const projectRoot = Deno.cwd();
  const cli = Deno.run({
    cmd: ["deno", "run", "--allow-read", "--allow-write", "--quiet", "cli.ts"],
    cwd: projectRoot,
    stdout: "piped",
    stdin: "piped",
  });
  const { stdin, stdout } = cli;
  assert(stdin);
  assert(stdout);
  const bufr = BufReader.create(stdout);
  const tp = new TextProtoReader(bufr);

  try {
    await sendMessage(stdin, {
      "id": ++seqId,
      "jsonrpc": "2.0",
      "method": "initialize",
      "params": {
        "rootUri": `file://${projectRoot}`,
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

    const headers = await tp.readMIMEHeader();
    assert(headers, "Unexpected eof");
    const contentLength = headers.get("Content-Length");
    assert(contentLength, "Malformed response");
    const buf = new Uint8Array(parseInt(contentLength));
    assert(await bufr.readFull(buf), "Unexpected eof");
    const initializeResult = JSON.parse(decode(buf));
    console.log(initializeResult);
    assertObjectMatch(initializeResult, {
      jsonrpc: "2.0",
      id: seqId,
      result: {
        serverInfo: { name: "deno-lsp" },
      },
    });
  } finally {
    cli.stdin.close();
    cli.stdout.close();
    cli.close();
  }
});
