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

  pathname(): string {
    return new URL(this.uri).pathname;
  }

  offsetAt(position: Position): number {
    return this.baseTextDocument.offsetAt(position);
  }
}
