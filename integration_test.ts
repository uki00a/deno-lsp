import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertStrictEquals,
  path,
} from "./deps.ts";
import { readResponse, sendMessage, withTimeout } from "./test_utils.ts";

Deno.test(
  "integration test",
  withTimeout(async () => {
    let seqId = 0;
    const projectRoot = Deno.cwd();
    const cli = Deno.run({
      cmd: [
        "deno",
        "run",
        "--allow-read",
        "--allow-write",
        "--quiet",
        "cli.ts",
      ],
      cwd: projectRoot,
      stdout: "piped",
      stdin: "piped",
    });
    const { stdin, stdout } = cli;
    assert(stdin);
    assert(stdout);

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

      const initializeResult = await readResponse(stdout);
      assertObjectMatch(initializeResult, {
        jsonrpc: "2.0",
        id: seqId,
        result: {
          serverInfo: { name: "deno-lsp" },
        },
      });

      await sendMessage(
        stdin,
        {
          "method": "textDocument/didOpen",
          "jsonrpc": "2.0",
          "params": {
            "textDocument": {
              "uri": `file://${projectRoot}/testdata/add.ts`,
              "version": 1,
              "languageId": "typescript",
              "text": await Deno.readTextFile(
                path.join(projectRoot, "testdata/add.ts"),
              ),
            },
          },
        },
      );

      await sendMessage(
        stdin,
        {
          "id": ++seqId,
          "jsonrpc": "2.0",
          "method": "textDocument/hover",
          "params": {
            "textDocument": {
              "uri": `file://${projectRoot}/testdata/add.ts`,
            },
            "position": { "character": 0, "line": 0 },
          },
        },
      );

      const hover = await readResponse(stdout);
      assertEquals(hover, {
        jsonrpc: "2.0",
        id: seqId,
        result: {
          contents: {
            language: "typescript",
            value: "function add(a: number, b: number): number",
          },
        },
      });
    } finally {
      cli.stdin.close();
      cli.stdout.close();
      cli.close();
    }
  }, 10 * 1000),
);
