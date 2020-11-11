import type { DocumentUri, TextDocumentContentChangeEvent } from "./deps.ts";

import {
  CodeActionKind,
  CompletionItemKind,
  CompletionItemTag,
  DiagnosticTag,
  Hover,
  Location,
  LocationLink,
  MarkedString,
  MarkupContent,
  MarkupKind,
  Position,
  Range,
  SymbolKind,
  TextDocumentIdentifier,
  TextDocumentItem,
  TextEdit,
} from "./deps.ts";

export type { DocumentUri, TextDocumentContentChangeEvent };

export {
  CodeActionKind,
  CompletionItemKind,
  CompletionItemTag,
  Hover,
  Location,
  LocationLink,
  MarkedString,
  MarkupContent,
  MarkupKind,
  Position,
  Range,
  SymbolKind,
  TextDocumentIdentifier,
  TextDocumentItem,
  TextEdit,
};

/**
 * @see https://www.jsonrpc.org/specification
 * @see https://github.com/tennashi/lsp_spec_ja
 */

// deno-lint-ignore ban-types
type Payload = object;

type Params = Payload | Array<Payload>;

export interface Message {
  readonly jsonrpc: string;
}

export interface RequestMessage extends Message {
  readonly id: number | string;
  readonly method: string;
  readonly params?: Params;
}

export interface NotificationMessage extends Message {
  method: string;
  params?: Params;
}

export type ResponseResult =
  | string
  | number
  | boolean
  | Payload
  | null;

export interface ResponseMessage extends Message {
  readonly id: number | string | null;
  readonly result?: ResponseResult;
  readonly error?: ResponseError;
}

export type ResponseErrorData =
  | string
  | number
  | boolean
  | Array<Payload>
  | Payload
  | null;

export interface ResponseError {
  readonly code: number;
  readonly message: string;
  readonly data?: ResponseErrorData;
}

export const ErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  serverErrorStart: -32099,
  serverErrorEnd: -32000,
  ServerNotInitialized: -32002,
  UnknownErrorCode: -32001,
  RequestCancelled: -32800,
  ContentModified: -32801,
};

export interface InitializeParams {
  processId: number | null;
  clientInfo?: {
    name: string;
    version?: string;
  };
  /**
   * @deprecated
   */
  rootPath?: string | null;
  rootUri: DocumentUri | null;
  // deno-lint-ignore no-explicit-any
  initializationOptions?: any;
  capabilities: ClientCapabilities;
  trace?: "off" | "messages" | "verbose";
  workspaceFolders?: WorkspaceFolder[] | null;
}

export interface WorkspaceFolder {
  uri: DocumentUri;
  name: string;
}

export interface InitializeResult {
  capabilities: ServerCapabilities;
  serverInfo?: {
    name: string;
    version?: string;
  };
}

export const InitializeError = {
  /**
	 * @deprecated
	 */
  unknownProtocolVersion: 1,
};

export interface WorkspaceEditClientCapabilities {
  documentChanges?: boolean;
  resourceOperations?: ResourceOperationKind[];
  failureHandling?: FailureHandlingKind;
}

export type ResourceOperationKind = "create" | "rename" | "delete";

export const ResourceOperationKind = {
  Create: "create",
  Rename: "rename",
  Delete: "delete",
};

export type FailureHandlingKind =
  | "abort"
  | "transactional"
  | "undo"
  | "textOnlyTransactional";

export const FailureHandlingKind = {
  Abort: "abort",
  Transactional: "transactional",
  TextOnlyTransactional: "textOnlyTransactional",
  Undo: "undo",
};

interface ClientCapabilities {
  workspace?: {
    applyEdit?: boolean;
    workspaceEdit?: WorkspaceEditClientCapabilities;
    didChangeConfiguration?: DidChangeConfigurationClientCapabilities;
    didChangeWatchedFiles?: DidChangeWatchedFilesClientCapabilities;
    symbol?: WorkspaceSymbolClientCapabilities;
    executeCommand?: ExecuteCommandClientCapabilities;
  };
  textDocument?: TextDocumentClientCapabilities;
  // deno-lint-ignore no-explicit-any
  experimental?: any;
}

export interface InitializeError {
  retry: boolean;
}

export interface ExecuteCommandOptions {
  commands: string[];
}

export interface DidChangeConfigurationClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DidChangeWatchedFilesClientCapabilities {
  dynamicRegistration?: boolean;
}

interface WorkspaceSymbolClientCapabilities {
  dynamicRegistration?: boolean;
  symbolKind?: {
    valueSet?: SymbolKind[];
  };
}

export interface ExecuteCommandClientCapabilities {
  dynamicRegistration?: boolean;
}

interface ServerCapabilities {
  textDocumentSync?: TextDocumentSyncOptions | number;
  completionProvider?: CompletionOptions;
  hoverProvider?: boolean | HoverOptions;
  signatureHelpProvider?: SignatureHelpOptions;
  declarationProvider?:
    | boolean
    | DeclarationOptions
    | DeclarationRegistrationOptions;
  definitionProvider?: boolean | DefinitionOptions;
  typeDefinitionProvider?:
    | boolean
    | TypeDefinitionOptions
    | TypeDefinitionRegistrationOptions;
  implementationProvider?:
    | boolean
    | ImplementationOptions
    | ImplementationRegistrationOptions;
  referencesProvider?: boolean | ReferenceOptions;
  documentHighlightProvider?: boolean | DocumentHighlightOptions;
  documentSymbolProvider?: boolean | DocumentSymbolOptions;
  codeActionProvider?: boolean | CodeActionOptions;
  codeLensProvider?: CodeLensOptions;
  documentLinkProvider?: DocumentLinkOptions;
  colorProvider?:
    | boolean
    | DocumentColorOptions
    | DocumentColorRegistrationOptions;
  documentFormattingProvider?: boolean | DocumentFormattingOptions;
  documentRangeFormattingProvider?: boolean | DocumentRangeFormattingOptions;
  documentOnTypeFormattingProvider?: DocumentOnTypeFormattingOptions;
  renameProvider?: boolean | RenameOptions;
  foldingRangeProvider?:
    | boolean
    | FoldingRangeOptions
    | FoldingRangeRegistrationOptions;
  executeCommandProvider?: ExecuteCommandOptions;
  workspaceSymbolProvider?: boolean;
  workspace?: {
    workspaceFolders?: WorkspaceFoldersServerCapabilities;
  };
  // deno-lint-ignore no-explicit-any
  experimental?: any;
}

export interface TextDocumentSyncOptions {
  openClose?: boolean;
  change?: TextDocumentSyncKind;
}

export interface CompletionOptions extends WorkDoneProgressOptions {
  triggerCharacters?: string[];
  allCommitCharacters?: string[];
  resolveProvider?: boolean;
}

export interface WorkDoneProgressOptions {
  workDoneProgress?: boolean;
}

// deno-lint-ignore no-empty-interface
export interface HoverOptions extends WorkDoneProgressOptions {
}

export interface SignatureHelpOptions extends WorkDoneProgressOptions {
  triggerCharacters?: string[];
  retriggerCharacters?: string[];
}

// deno-lint-ignore no-empty-interface
export interface DeclarationOptions extends WorkDoneProgressOptions {
}

export interface DeclarationRegistrationOptions
  extends
    DeclarationOptions,
    TextDocumentRegistrationOptions,
    StaticRegistrationOptions {
}

export interface TextDocumentRegistrationOptions {
  documentSelector: DocumentSelector | null;
}

interface StaticRegistrationOptions {
  id?: string;
}

// deno-lint-ignore no-empty-interface
export interface TypeDefinitionOptions extends WorkDoneProgressOptions {
}

export interface TypeDefinitionRegistrationOptions
  extends
    TextDocumentRegistrationOptions,
    TypeDefinitionOptions,
    StaticRegistrationOptions {
}

// deno-lint-ignore no-empty-interface
export interface ImplementationOptions extends WorkDoneProgressOptions {
}

export interface ImplementationRegistrationOptions
  extends
    TextDocumentRegistrationOptions,
    ImplementationOptions,
    StaticRegistrationOptions {
}

// deno-lint-ignore no-empty-interface
export interface ReferenceOptions extends WorkDoneProgressOptions {
}

// deno-lint-ignore no-empty-interface
export interface DocumentHighlightOptions extends WorkDoneProgressOptions {
}

// deno-lint-ignore no-empty-interface
export interface DocumentSymbolOptions extends WorkDoneProgressOptions {
}

export interface CodeActionOptions extends WorkDoneProgressOptions {
  codeActionKinds?: CodeActionKind[];
}

export interface CodeLensOptions extends WorkDoneProgressOptions {
  resolveProvider?: boolean;
}

export interface DocumentLinkOptions extends WorkDoneProgressOptions {
  resolveProvider?: boolean;
}

// deno-lint-ignore no-empty-interface
export interface DocumentColorOptions extends WorkDoneProgressOptions {
}

export interface DocumentColorRegistrationOptions
  extends
    TextDocumentRegistrationOptions,
    StaticRegistrationOptions,
    DocumentColorOptions {
}

// deno-lint-ignore no-empty-interface
export interface DocumentFormattingOptions extends WorkDoneProgressOptions {
}

// deno-lint-ignore no-empty-interface
export interface DocumentRangeFormattingOptions
  extends WorkDoneProgressOptions {
}

export interface DocumentOnTypeFormattingOptions {
  firstTriggerCharacter: string;
  moreTriggerCharacter?: string[];
}

export interface RenameOptions extends WorkDoneProgressOptions {
  prepareProvider?: boolean;
}

// deno-lint-ignore no-empty-interface
export interface FoldingRangeOptions extends WorkDoneProgressOptions {
}

export interface FoldingRangeRegistrationOptions
  extends
    TextDocumentRegistrationOptions,
    FoldingRangeOptions,
    StaticRegistrationOptions {
}

export interface WorkspaceFoldersServerCapabilities {
  supported?: boolean;
  changeNotifications?: string | boolean;
}

export type TextDocumentSyncKind = 0 | 1 | 2;
export const TextDocumentSyncKind = {
  None: 0,
  Full: 1,
  Incremental: 2,
};

export interface TextDocumentSyncClientCapabilities {
  dynamicRegistration?: boolean;
  willSave?: boolean;
  willSaveWaitUntil?: boolean;
  didSave?: boolean;
}

export interface HoverClientCapabilities {
  dynamicRegistration?: boolean;
  contentFormat?: MarkupKind[];
}

export interface CompletionClientCapabilities {
  dynamicRegistration?: boolean;
  completionItem?: {
    snippetSupport?: boolean;
    commitCharactersSupport?: boolean;
    documentationFormat?: MarkupKind[];
    deprecatedSupport?: boolean;
    preselectSupport?: boolean;
    tagSupport?: {
      valueSet: CompletionItemTag[];
    };
  };

  completionItemKind?: {
    valueSet?: CompletionItemKind[];
  };
  contextSupport?: boolean;
}

export interface SignatureHelpClientCapabilities {
  dynamicRegistration?: boolean;
  signatureInformation?: {
    documentationFormat?: MarkupKind[];
    parameterInformation?: {
      labelOffsetSupport?: boolean;
    };
  };
  contextSupport?: boolean;
}

export interface DeclarationClientCapabilities {
  dynamicRegistration?: boolean;
  linkSupport?: boolean;
}

export interface DefinitionClientCapabilities {
  dynamicRegistration?: boolean;
  linkSupport?: boolean;
}

export interface TypeDefinitionClientCapabilities {
  dynamicRegistration?: boolean;
  linkSupport?: boolean;
}

export interface ImplementationClientCapabilities {
  dynamicRegistration?: boolean;
  linkSupport?: boolean;
}

export interface ReferenceClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DocumentSymbolClientCapabilities {
  dynamicRegistration?: boolean;
  symbolKind?: {
    valueSet?: SymbolKind[];
  };
  hierarchicalDocumentSymbolSupport?: boolean;
}

export interface CodeActionClientCapabilities {
  dynamicRegistration?: boolean;
  codeActionLiteralSupport?: {
    codeActionKind: {
      valueSet: CodeActionKind[];
    };
  };
  isPreferredSupport?: boolean;
}

export interface CodeLensClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DocumentLinkClientCapabilities {
  dynamicRegistration?: boolean;
  tooltipSupport?: boolean;
}

export interface DocumentColorClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DocumentFormattingClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DocumentRangeFormattingClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DocumentOnTypeFormattingClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface RenameClientCapabilities {
  dynamicRegistration?: boolean;
  prepareSupport?: boolean;
}

export interface PublishDiagnosticsClientCapabilities {
  relatedInformation?: boolean;
  tagSupport?: {
    valueSet: DiagnosticTag[];
  };
  versionSupport?: boolean;
  codeDescriptionSupport?: boolean;
  dataSupport?: boolean;
}

export interface FoldingRangeClientCapabilities {
  dynamicRegistration?: boolean;
  rangeLimit?: number;
  lineFoldingOnly?: boolean;
}

export type DocumentSelector = DocumentFilter[];

export interface DocumentFilter {
  language?: string;
  scheme?: string;
  pattern?: string;
}

// deno-lint-ignore no-empty-interface
export interface DefinitionOptions extends WorkDoneProgressOptions {
}

export interface TextDocumentClientCapabilities {
  synchronization?: TextDocumentSyncClientCapabilities;
  completion?: CompletionClientCapabilities;
  hover?: HoverClientCapabilities;
  signatureHelp?: SignatureHelpClientCapabilities;
  declaration?: DeclarationClientCapabilities;
  definition?: DefinitionClientCapabilities;
  typeDefinition?: TypeDefinitionClientCapabilities;
  implementation?: ImplementationClientCapabilities;
  references?: ReferenceClientCapabilities;
  documentHighlight?: DocumentSymbolClientCapabilities;
  documentSymbol?: DocumentSymbolClientCapabilities;
  codeAction?: CodeActionClientCapabilities;
  codeLens?: CodeLensClientCapabilities;
  documentLink?: DocumentLinkClientCapabilities;
  colorProvider?: DocumentColorClientCapabilities;
  formatting?: DocumentFormattingClientCapabilities;
  rangeFormatting?: DocumentRangeFormattingClientCapabilities;
  onTypeFormatting?: DocumentOnTypeFormattingClientCapabilities;
  rename?: RenameClientCapabilities;
  publishDiagnostics?: PublishDiagnosticsClientCapabilities;
  foldingRange?: FoldingRangeClientCapabilities;
}

export interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}

type ProgressToken = number | string;
export interface WorkDoneProgressParams {
  workDoneToken?: ProgressToken;
}

export interface HoverParams
  extends TextDocumentPositionParams, WorkDoneProgressParams {
}

export interface DidOpenTextDocumentParams {
  textDocument: TextDocumentItem;
}

export interface DidCloseTextDocumentParams {
  textDocument: TextDocumentIdentifier;
}

export interface DefinitionParams
  extends
    TextDocumentPositionParams,
    WorkDoneProgressParams,
    PartialResultParams {
}

export interface PartialResultParams {
  partialResultToken?: ProgressToken;
}

export function isRequestMessage(
  message: RequestMessage | NotificationMessage,
): message is RequestMessage {
  return "id" in message;
}
