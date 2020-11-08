import { assert } from "./deps.ts";

export class Project {
  #rootPath: string;
  #scriptFileNames: Set<string>;
  #scriptFileNamesAsArray: Array<string>;
  #versions: { [scriptFileName: string]: { version: number } };

  constructor(rootPath: string, scriptFileName: string[]) {
    assert(rootPath.startsWith("/"), "rootPath must start with '/'");
    this.#rootPath = rootPath;
    this.#scriptFileNames = new Set(
      scriptFileName.map((x) => this.relativizeScriptFileName(x)),
    );
    this.#scriptFileNamesAsArray = Array.from(this.#scriptFileNames);
    this.#versions = {};
    for (const scriptFile of this.#scriptFileNames) {
      this.#versions[scriptFile] = { version: 0 };
    }
  }

  rootPath(): string {
    return this.#rootPath;
  }

  scriptFileNames(): string[] {
    return this.#scriptFileNamesAsArray;
  }

  versionFor(scriptFile: string): number {
    return this.#versions[this.relativizeScriptFileName(scriptFile)].version;
  }

  addScriptFile(scriptFile: string): void {
    scriptFile = this.relativizeScriptFileName(scriptFile);
    if (!this.hasScriptFile(scriptFile)) {
      this.#scriptFileNames.add(scriptFile);
      this.#scriptFileNamesAsArray.push(scriptFile);
      this.#versions[scriptFile] = { version: 0 };
    }
  }

  removeScriptFile(scriptFile: string): void {
    scriptFile = this.relativizeScriptFileName(scriptFile);
    if (this.hasScriptFile(scriptFile)) {
      this.#scriptFileNames.delete(scriptFile);
      this.#scriptFileNamesAsArray.splice(
        this.#scriptFileNamesAsArray.indexOf(scriptFile),
        1,
      );
    }
  }

  hasScriptFile(scriptFile: string): boolean {
    scriptFile = this.relativizeScriptFileName(scriptFile);
    return this.#scriptFileNames.has(scriptFile);
  }

  relativizeScriptFileName(scriptFile: string): string {
    scriptFile = scriptFile.startsWith(this.#rootPath)
      ? scriptFile.slice(this.#rootPath.length)
      : scriptFile;
    return scriptFile.startsWith("/") ? scriptFile.slice(1) : scriptFile;
  }
}
