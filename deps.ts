// @deno-types="https://unpkg.com/typescript@4.0.3/lib/typescript.d.ts"
import {
  CompilerOptions,
  default as ts,
  LanguageService,
  LanguageServiceHost,
} from "https://jspm.dev/typescript@4.0.3/lib/typescript.js";

export type { CompilerOptions, LanguageService, LanguageServiceHost };
export { ts };

// https://github.com/microsoft/vscode-languageserver-node/tree/0979376c8fd626c87064aca0bdd4c297340d6b9c/textDocument
// @deno-types="https://unpkg.com/vscode-languageserver-textdocument@1.0.1/lib/esm/main.d.ts"
import {
  DocumentUri,
  Position,
  Range,
  TextDocument,
  TextDocumentContentChangeEvent,
  TextEdit,
} from "https://cdn.skypack.dev/vscode-languageserver-textdocument@1.0.1";

export { TextDocument };
export type {
  DocumentUri,
  Position,
  Range,
  TextDocumentContentChangeEvent,
  TextEdit,
};

export * as log from "https://deno.land/std@0.77.0/log/mod.ts";
export type { LevelName as LogLevelName } from "https://deno.land/std@0.77.0/log/mod.ts";
export {
  assert,
  assertEquals,
  assertObjectMatch,
  assertStrictEquals,
} from "https://deno.land/std@0.77.0/testing/asserts.ts";
export { deferred } from "https://deno.land/std@0.77.0/async/deferred.ts";
export type { Deferred } from "https://deno.land/std@0.77.0/async/deferred.ts";
export * as path from "https://deno.land/std@0.77.0/path/mod.ts";
export { BufReader, BufWriter } from "https://deno.land/std@0.77.0/io/bufio.ts";
export { TextProtoReader } from "https://deno.land/std@0.77.0/textproto/mod.ts";
export { decode, encode } from "https://deno.land/std@0.77.0/encoding/utf8.ts";
