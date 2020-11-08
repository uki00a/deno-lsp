import type { Position, TextDocumentItem } from "./protocol.ts";
export class TextDocument {
  constructor(private readonly textDocument: TextDocumentItem) {}

  get uri(): string {
    return this.textDocument.uri;
  }

  pathname(): string {
    return new URL(this.uri).pathname;
  }

  position(position: Position): number {
    let pos = 0;
    const lines = this.textDocument.text.split("\n");
    for (let i = 0; i < position.line; i++) {
      pos += lines[i].length;
    }
    pos += position.character;
    return pos;
  }
}
