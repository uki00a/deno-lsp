export class Project {
  #rootUri: string;
  #scriptFileNames: Set<string>;
  #scriptFileNamesAsArray: Array<string>;
  #versions: { [scriptFileName: string]: { version: number } };

  constructor(rootUri: string, scriptFileName: string[]) {
    this.#rootUri = rootUri;
    this.#scriptFileNames = new Set(
      scriptFileName.map((x) => this.normalizeScriptFileName(x)),
    );
    this.#scriptFileNamesAsArray = Array.from(this.#scriptFileNames);
    this.#versions = {};
    for (const scriptFile of this.#scriptFileNames) {
      this.#versions[scriptFile] = { version: 0 };
    }
  }

  rootUri(): string {
    return this.#rootUri;
  }

  scriptFileNames(): string[] {
    return this.#scriptFileNamesAsArray;
  }

  versionFor(scriptFile: string): number {
    return this.#versions[this.normalizeScriptFileName(scriptFile)].version;
  }

  addScriptFile(scriptFile: string): void {
    scriptFile = this.normalizeScriptFileName(scriptFile);
    if (!this.hasScriptFile(scriptFile)) {
      this.#scriptFileNames.add(scriptFile);
      this.#scriptFileNamesAsArray.push(scriptFile);
      this.#versions[scriptFile] = { version: 0 };
    }
  }

  removeScriptFile(scriptFile: string): void {
    scriptFile = this.normalizeScriptFileName(scriptFile);
    if (this.hasScriptFile(scriptFile)) {
      this.#scriptFileNames.delete(scriptFile);
      this.#scriptFileNamesAsArray.splice(
        this.#scriptFileNamesAsArray.indexOf(scriptFile),
        1,
      );
    }
  }

  hasScriptFile(scriptFile: string): boolean {
    scriptFile = this.normalizeScriptFileName(scriptFile);
    return this.#scriptFileNames.has(scriptFile);
  }

  uriToScriptFileName(uri: string) {
    return this.normalizeScriptFileName(uri);
  }

  private normalizeScriptFileName(scriptFile: string): string {
    scriptFile = scriptFile.startsWith(this.#rootUri)
      ? scriptFile.slice(this.#rootUri.length)
      : scriptFile;
    return scriptFile.startsWith("/") ? scriptFile.slice(1) : scriptFile;
  }
}
