/**
 * Adopted from https://github.com/theia-ide/typescript-language-server/blob/cb672280c3856e6dd68620be084e6c851d80fc7f/server/src/protocol-translation.ts
 *
 * Copyright (C) 2017, 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  Location,
  MarkupContent,
  MarkupKind,
  Position,
  Range,
  SymbolKind,
  TextEdit,
} from "./protocol.ts";
import { ts } from "./deps.ts";
import { TextDocument } from "./text_document.ts";

interface TSLocation {
  line: number;
  offset: number;
}

export function toPosition(location: TSLocation): Position {
  return {
    line: location.line - 1,
    character: location.offset - 1,
  };
}

export function toTextEdit(
  edit: ts.TextChange,
  document: TextDocument,
): TextEdit {
  const start = document.positionAt(edit.span.start);
  const end = document.positionAt(edit.span.start + edit.span.length);
  return {
    range: {
      start,
      end,
    },
    newText: edit.newText ?? "",
  };
}

function tagsMarkdownPreview(tags: ts.JSDocTagInfo[]): string {
  return (tags || [])
    .map((tag) => {
      const label = `*@${tag.name}*`;
      if (!tag.text) {
        return label;
      }
      return label +
        (tag.text.match(/\r\n|\n/g) ? "  \n" + tag.text : ` — ${tag.text}`);
    })
    .join("  \n\n");
}

export function asRange(span: ts.TextSpan, document: TextDocument): Range {
  const start = document.positionAt(span.start);
  const end = document.positionAt(span.start + span.length);
  return Range.create(start, end);
}

export function asDocumentation(data: {
  documentation?: SymbolDisplayPart[];
  tags?: ts.JSDocTagInfo[];
}): MarkupContent | undefined {
  let value = "";
  const documentation = asPlainText(data.documentation);
  if (documentation) {
    value += documentation;
  }
  if (data.tags) {
    const tagsDocumentation = asTagsDocumentation(data.tags);
    if (tagsDocumentation) {
      value += "\n\n" + tagsDocumentation;
    }
  }
  return value.length
    ? {
      kind: MarkupKind.Markdown,
      value,
    }
    : undefined;
}

export function asTagsDocumentation(tags: ts.JSDocTagInfo[]): string {
  return tags.map(asTagDocumentation).join("  \n\n");
}

export function asTagDocumentation(tag: ts.JSDocTagInfo): string {
  switch (tag.name) {
    case "param": {
      const body = (tag.text || "").split(/^([\w\.]+)\s*-?\s*/);
      if (body && body.length === 3) {
        const param = body[1];
        const doc = body[2];
        const label = `*@${tag.name}* \`${param}\``;
        if (!doc) {
          return label;
        }
        return label + (doc.match(/\r\n|\n/g) ? "  \n" + doc : ` — ${doc}`);
      }
      break;
    }
    default:
      break;
  }

  // Generic tag
  const label = `*@${tag.name}*`;
  const text = asTagBodyText(tag);
  if (!text) {
    return label;
  }
  return label + (text.match(/\r\n|\n/g) ? "  \n" + text : ` — ${text}`);
}

export function asTagBodyText(tag: ts.JSDocTagInfo): string | undefined {
  if (!tag.text) {
    return undefined;
  }

  switch (tag.name) {
    case "example":
    case "default":
      // Convert to markdown code block if it not already one
      if (tag.text.match(/^\s*[~`]{3}/g)) {
        return tag.text;
      }
      return "```\n" + tag.text + "\n```";
  }

  return tag.text;
}

interface SymbolDisplayPart {
  text: string;
}

export function asPlainText(parts: undefined): undefined;
export function asPlainText(parts: SymbolDisplayPart[]): string;
export function asPlainText(
  parts: SymbolDisplayPart[] | undefined,
): string | undefined;
export function asPlainText(
  parts: SymbolDisplayPart[] | undefined,
): string | undefined {
  if (!parts) {
    return undefined;
  }
  return parts.map((part) => part.text).join("");
}
