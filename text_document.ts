import type { Position, TextDocumentItem } from "./protocol.ts";
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
}
