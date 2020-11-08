import { path, ts } from "./deps.ts";
import type { CompilerOptions, LanguageService } from "./deps.ts";
import { createServiceHost } from "./host.ts";
import type { Project } from "./project.ts";
import type { Logger } from "./logger.ts";

async function readTSConfig(directory: string): Promise<CompilerOptions> {
  const tsconfigPath = path.join(directory, "tsconfig.json");
  try {
    const stat = await Deno.lstat(tsconfigPath);
    if (stat.isFile) {
      return JSON.parse(await Deno.readTextFile(tsconfigPath));
    } else {
      return {};
    }
  } catch {
    return {};
  }
}

/**
 * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#incremental-build-support-using-the-language-services
 */
export async function createLanguageService(
  project: Project,
  logger: Logger,
): Promise<LanguageService> {
  logger.debug("Creating LanguageService for project: ", project.rootPath());
  const tsConfig = await readTSConfig(project.rootPath());
  const host = createServiceHost(project, tsConfig, logger);
  const languageService = ts.createLanguageService(
    host,
    ts.createDocumentRegistry(),
  );
  return languageService;
}
