/*
 * Adopted from https://github.com/theia-ide/typescript-language-server/blob/cb672280c3856e6dd68620be084e6c851d80fc7f/server/src/completion.ts
 *
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  Command,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  Range,
  TextEdit,
} from "./protocol.ts";
// import type { CompletionEntry, CompletionEntryDetails } from "./deps.ts";
import { ts } from "./deps.ts";
import { TextDocument } from "./text_document.ts";
import {
  asDocumentation,
  asPlainText,
  asRange,
  asTagsDocumentation,
  toTextEdit,
} from "./protocol-translation.ts";
import { Commands } from "./commands.ts";

export interface TSCompletionItem extends CompletionItem {
  data: {
    file: string;
    line: number;
    offset: number;
    entryNames: Array<{ name: string; source: string } | string>;
  };
}

export function asCompletionItem(
  entry: ts.CompletionEntry,
  file: string,
  position: Position,
  document: TextDocument,
): TSCompletionItem {
  const item: TSCompletionItem = {
    label: entry.name,
    kind: asCompletionItemKind(entry.kind),
    sortText: entry.sortText,
    commitCharacters: asCommitCharacters(entry.kind),
    data: {
      file,
      line: position.line + 1,
      offset: position.character + 1,
      entryNames: [
        entry.source ? { name: entry.name, source: entry.source } : entry.name,
      ],
    },
  };
  if (entry.isRecommended) {
    // Make sure isRecommended property always comes first
    // https://github.com/Microsoft/vscode/issues/40325
    item.preselect = true;
  } else if (entry.source) {
    // De-prioritze auto-imports
    // https://github.com/Microsoft/vscode/issues/40311
    item.sortText = "\uffff" + entry.sortText;
  }
  if (
    item.kind === CompletionItemKind.Function ||
    item.kind === CompletionItemKind.Method
  ) {
    item.insertTextFormat = InsertTextFormat.Snippet;
  }

  let insertText = entry.insertText;
  let replacementRange = entry.replacementSpan &&
    asRange(entry.replacementSpan, document);
  // Make sure we only replace a single line at most
  if (
    replacementRange &&
    replacementRange.start.line !== replacementRange.end.line
  ) {
    replacementRange = Range.create(
      replacementRange.start,
      document.getLineEnd(replacementRange.start.line),
    );
  }
  if (insertText && replacementRange && insertText[0] === "[") { // o.x -> o['x']
    item.filterText = "." + item.label;
  }
  if (entry.kindModifiers && entry.kindModifiers.match(/\boptional\b/)) {
    if (!insertText) {
      insertText = item.label;
    }
    if (!item.filterText) {
      item.filterText = item.label;
    }
    item.label += "?";
  }
  if (insertText && replacementRange) {
    item.textEdit = TextEdit.replace(replacementRange, insertText);
  } else {
    item.insertText = insertText;
  }
  return item;
}

export function asCompletionItemKind(
  kind: ts.ScriptElementKind,
): CompletionItemKind {
  switch (kind) {
    case ts.ScriptElementKind.primitiveType:
    case ts.ScriptElementKind.keyword:
      return CompletionItemKind.Keyword;
    case ts.ScriptElementKind.constElement:
      return CompletionItemKind.Constant;
    case ts.ScriptElementKind.letElement:
    case ts.ScriptElementKind.variableElement:
    case ts.ScriptElementKind.localVariableElement:
    case ts.ScriptElementKind.alias:
      return CompletionItemKind.Variable;
    case ts.ScriptElementKind.memberVariableElement:
    case ts.ScriptElementKind.memberGetAccessorElement:
    case ts.ScriptElementKind.memberSetAccessorElement:
      return CompletionItemKind.Field;
    case ts.ScriptElementKind.functionElement:
      return CompletionItemKind.Function;
    case ts.ScriptElementKind.memberFunctionElement:
    case ts.ScriptElementKind.constructSignatureElement:
    case ts.ScriptElementKind.callSignatureElement:
    case ts.ScriptElementKind.indexSignatureElement:
      return CompletionItemKind.Method;
    case ts.ScriptElementKind.enumElement:
      return CompletionItemKind.Enum;
    case ts.ScriptElementKind.moduleElement:
    case ts.ScriptElementKind.externalModuleName:
      return CompletionItemKind.Module;
    case ts.ScriptElementKind.classElement:
    case ts.ScriptElementKind.typeElement:
      return CompletionItemKind.Class;
    case ts.ScriptElementKind.interfaceElement:
      return CompletionItemKind.Interface;
    case ts.ScriptElementKind.warning:
    case ts.ScriptElementKind.scriptElement:
      return CompletionItemKind.File;
    case ts.ScriptElementKind.directory:
      return CompletionItemKind.Folder;
    case ts.ScriptElementKind.string:
      return CompletionItemKind.Constant;
  }
  return CompletionItemKind.Property;
}

export function asCommitCharacters(
  kind: ts.ScriptElementKind,
): string[] | undefined {
  const commitCharacters: string[] = [];
  switch (kind) {
    case ts.ScriptElementKind.memberGetAccessorElement:
    case ts.ScriptElementKind.memberSetAccessorElement:
    case ts.ScriptElementKind.constructSignatureElement:
    case ts.ScriptElementKind.callSignatureElement:
    case ts.ScriptElementKind.indexSignatureElement:
    case ts.ScriptElementKind.enumElement:
    case ts.ScriptElementKind.interfaceElement:
      commitCharacters.push(".");
      break;

    case ts.ScriptElementKind.moduleElement:
    case ts.ScriptElementKind.alias:
    case ts.ScriptElementKind.constElement:
    case ts.ScriptElementKind.letElement:
    case ts.ScriptElementKind.variableElement:
    case ts.ScriptElementKind.localVariableElement:
    case ts.ScriptElementKind.memberVariableElement:
    case ts.ScriptElementKind.classElement:
    case ts.ScriptElementKind.functionElement:
    case ts.ScriptElementKind.memberFunctionElement:
      commitCharacters.push(".", ",");
      commitCharacters.push("(");
      break;
  }

  return commitCharacters.length === 0 ? undefined : commitCharacters;
}

/*
export function asResolvedCompletionItem(
  item: TSCompletionItem,
  details: ts.CompletionEntryDetails,
): TSCompletionItem {
  item.detail = asDetail(details);
  item.documentation = asDocumentation(details);
  Object.assign(item, asCodeActions(details, item.data.file));
  return item;
}

export function asCodeActions(
  details: ts.CompletionEntryDetails,
  filepath: string,
): {
  command?: Command;
  additionalTextEdits?: TextEdit[];
} {
  if (!details.codeActions || !details.codeActions.length) {
    return {};
  }

  // Try to extract out the additionalTextEdits for the current file.
  // Also check if we still have to apply other workspace edits and commands
  // using a vscode command
  const additionalTextEdits: TextEdit[] = [];
  let hasReaminingCommandsOrEdits = false;
  for (const tsAction of details.codeActions) {
    if (tsAction.commands) {
      hasReaminingCommandsOrEdits = true;
    }

    // Apply all edits in the current file using `additionalTextEdits`
    if (tsAction.changes) {
      for (const change of tsAction.changes) {
        if (change.fileName === filepath) {
          for (const textChange of change.textChanges) {
            additionalTextEdits.push(toTextEdit(textChange));
          }
        } else {
          hasReaminingCommandsOrEdits = true;
        }
      }
    }
  }

  let command: Command | undefined = undefined;
  if (hasReaminingCommandsOrEdits) {
    // Create command that applies all edits not in the current file.
    command = {
      title: "",
      command: Commands.APPLY_COMPLETION_CODE_ACTION,
      arguments: [
        filepath,
        details.codeActions.map((codeAction) => ({
          commands: codeAction.commands,
          description: codeAction.description,
          changes: codeAction.changes.filter((x) => x.fileName !== filepath),
        })),
      ],
    };
  }

  return {
    command,
    additionalTextEdits: additionalTextEdits.length
      ? additionalTextEdits
      : undefined,
  };
}
*/

export function asDetail(
  { displayParts, source }: ts.CompletionEntryDetails,
): string | undefined {
  const result: string[] = [];
  const importPath = asPlainText(source);
  if (importPath) {
    result.push(`Auto import from '${importPath}'`);
  }
  const detail = asPlainText(displayParts);
  if (detail) {
    result.push(detail);
  }
  return result.join("\n");
}
