import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertStrictEquals,
  path,
} from "./deps.ts";
import { readResponse, sendMessage, testLSP } from "./test_utils.ts";

testLSP({
  name: "hover",
  async fn(lsp) {
    const testTSFile = path.join(lsp.projectRoot, "add.ts");
    await sendMessage(
      lsp.stdin,
      {
        "method": "textDocument/didOpen",
        "jsonrpc": "2.0",
        "params": {
          "textDocument": {
            "uri": path.toFileUrl(testTSFile).href,
            "version": 1,
            "languageId": "typescript",
            "text": await Deno.readTextFile(
              testTSFile,
            ),
          },
        },
      },
    );

    const nextID = lsp.nextID();
    await sendMessage(
      lsp.stdin,
      {
        "id": nextID,
        "jsonrpc": "2.0",
        "method": "textDocument/hover",
        "params": {
          "textDocument": {
            "uri": path.toFileUrl(testTSFile).href,
          },
          "position": { "character": 0, "line": 0 },
        },
      },
    );

    const hover = await readResponse(lsp.stdout);
    assertEquals(hover, {
      jsonrpc: "2.0",
      id: nextID,
      result: {
        contents: {
          language: "typescript",
          value: "function add(a: number, b: number): number",
        },
      },
    });
  },
  projectRoot: path.resolve("testdata/hover"),
});

testLSP({
  name: "definition",
  async fn(lsp) {
    const testTSFile = path.join(lsp.projectRoot, "sample.ts");
    await sendMessage(
      lsp.stdin,
      {
        "method": "textDocument/didOpen",
        "jsonrpc": "2.0",
        "params": {
          "textDocument": {
            "uri": path.toFileUrl(testTSFile).href,
            "version": 1,
            "languageId": "typescript",
            "text": await Deno.readTextFile(
              testTSFile,
            ),
          },
        },
      },
    );

    const nextID = lsp.nextID();
    await sendMessage(lsp.stdin, {
      "id": nextID,
      "jsonrpc": "2.0",
      "method": "textDocument/definition",
      "params": {
        "textDocument": {
          "uri": path.toFileUrl(testTSFile).href,
        },
        "position": {
          "line": 0,
          "character": 1,
        },
      },
    });

    const definitions = await readResponse(lsp.stdout);
    assertEquals(definitions, {
      id: nextID,
      jsonrpc: "2.0",
      result: [
        {
          uri: path.toFileUrl(testTSFile).href,
          range: {
            start: {
              line: 6,
              character: 16,
            },
            end: {
              line: 6,
              character: 18,
            },
          },
        },
      ],
    });
  },
  projectRoot: path.resolve("testdata/definition"),
});
