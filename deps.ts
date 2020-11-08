// @deno-types="https://unpkg.com/typescript@4.0.3/lib/typescript.d.ts"
import {
  CompilerOptions as _CompilerOptions,
  default as _ts,
  LanguageService as _LanguageService,
  LanguageServiceHost as _LanguageServiceHost,
} from "https://jspm.dev/typescript@4.0.3/lib/typescript.js";

export type LanguageServiceHost = _LanguageServiceHost;
export type LanguageService = _LanguageService;
export type CompilerOptions = _CompilerOptions;
export const ts = _ts;

export * as log from "https://deno.land/std@0.76.0/log/mod.ts";
export type { LevelName as LogLevelName } from "https://deno.land/std@0.76.0/log/mod.ts";
export {
  assert,
  assertEquals,
  assertObjectMatch,
  assertStrictEquals,
} from "https://deno.land/std@0.76.0/testing/asserts.ts";
export { deferred } from "https://deno.land/std@0.76.0/async/deferred.ts";
export type { Deferred } from "https://deno.land/std@0.76.0/async/deferred.ts";
export * as path from "https://deno.land/std@0.76.0/path/mod.ts";
export { BufReader, BufWriter } from "https://deno.land/std@0.76.0/io/bufio.ts";
export { TextProtoReader } from "https://deno.land/std@0.76.0/textproto/mod.ts";
export { decode, encode } from "https://deno.land/std@0.76.0/encoding/utf8.ts";
