/**
 * Adopted from https://github.com/theia-ide/typescript-language-server/blob/cb672280c3856e6dd68620be084e6c851d80fc7f/server/src/document.ts
 *
 * Copyright (C) 2017, 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
import { Position } from "./protocol.ts";
import type { TextDocumentItem } from "./protocol.ts";
import { TextDocument as BaseTextDocument } from "./deps.ts";

// TODO Remove this class...
export class TextDocument {
  private readonly baseTextDocument: BaseTextDocument;
  constructor(textDocument: TextDocumentItem) {
    this.baseTextDocument = BaseTextDocument.create(
      textDocument.uri,
      textDocument.languageId,
      textDocument.version,
      textDocument.text,
    );
  }

  get uri(): string {
    return this.baseTextDocument.uri;
  }

  get version(): number {
    return this.baseTextDocument.version;
  }

  pathname(): string {
    return new URL(this.uri).pathname;
  }

  positionAt(offset: number): Position {
    return this.baseTextDocument.positionAt(offset);
  }

  offsetAt(position: Position): number {
    return this.baseTextDocument.offsetAt(position);
  }

  getLineEnd(line: number): Position {
    const nextLineOffset = this.getLineOffset(line + 1);
    return this.positionAt(nextLineOffset - 1);
  }

  getLineOffset(line: number): number {
    const lineStart = this.getLineStart(line);
    return this.offsetAt(lineStart);
  }

  getLineStart(line: number): Position {
    return Position.create(line, 0);
  }
}
