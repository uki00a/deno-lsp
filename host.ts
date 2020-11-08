import { ts } from "./deps.ts";
import type { CompilerOptions, LanguageServiceHost } from "./deps.ts";
import { directoryExistsSync, existsSync, fileExistsSync } from "./fs.ts";
import type { Project } from "./project.ts";
import type { Logger } from "./logger.ts";

/**
 * @see https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#incremental-build-support-using-the-language-services
 */
export function createServiceHost(
  project: Project,
  options: CompilerOptions,
  logger: Logger,
): LanguageServiceHost {
  return {
    getScriptFileNames: () => {
      return project.scriptFileNames();
    },
    getScriptVersion(fileName: string): string {
      return project.versionFor(fileName).toString();
    },
    getScriptSnapshot(fileName: string) {
      logger.debug("host.getScriptSnapshot(): ", fileName);
      if (!existsSync(fileName)) {
        return undefined;
      }

      const snapshot = ts.ScriptSnapshot.fromString(
        Deno.readTextFileSync(fileName),
      );
      return snapshot;
    },
    getCurrentDirectory: () => Deno.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName(options: CompilerOptions) {
      return ts.getDefaultLibFilePath(options);
    },
    fileExists: fileExistsSync,
    readFile(path) {
      logger.debug("host.readFile(): ", path);
      return Deno.readTextFileSync(path);
    },
    readDirectory(path, extensions, exclude, include, depth) {
      throw new Error("readDirectory(): unimplemented");
    },
    directoryExists: directoryExistsSync,
    getDirectories(path: string): string[] {
      const directories = [];
      logger.debug("host.getDirectories(): ", path);
      for (const entry of Deno.readDirSync(path)) {
        // TODO isSymlink
        if (entry.isDirectory) {
          directories.push(entry.name);
        }
      }
      return directories;
    },
  };
}
