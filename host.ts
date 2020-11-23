import { path, ts } from "./deps.ts";
import type { CompilerOptions, LanguageServiceHost } from "./deps.ts";
import { directoryExistsSync, existsSync, fileExistsSync } from "./fs.ts";
import type { Project } from "./project.ts";
import type { Logger } from "./logger.ts";

const ASSETS = "asset://";
const DEFAULT_LIB = "lib.deno.d.ts";
const LIB_DIR = path.join(
  path.dirname(path.fromFileUrl(import.meta.url)),
  "lib",
);

function resolveLibFileName(lib: string): string {
  return path.join(LIB_DIR, lib);
}

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
      // FIXME
      if (fileName.startsWith(ASSETS)) {
        return "0";
      }
      return project.versionFor(fileName).toString();
    },
    getScriptSnapshot(fileName: string) {
      // TODO cache script files
      fileName = fileName.startsWith(ASSETS)
        ? resolveLibFileName(fileName.slice(ASSETS.length + 1))
        : project.resolveUri(fileName).pathname;
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
      return `${ASSETS}/${DEFAULT_LIB}`;
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
