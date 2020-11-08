export async function collectRootFiles(directory: string): Promise<string[]> {
  const rootFiles = [] as string[];
  for await (const entry of Deno.readDir(directory)) {
    if (!entry.isFile) {
      continue;
    }
    const fileName = entry.name;
    if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) {
      rootFiles.push(fileName);
    }
  }
  return rootFiles;
}

export function existsSync(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch (_) {
    return false;
  }
}

export function fileExistsSync(path: string): boolean {
  try {
    const stat = Deno.statSync(path);
    return stat.isFile;
  } catch (_) {
    return false;
  }
}

export function directoryExistsSync(path: string): boolean {
  try {
    const stat = Deno.statSync(path);
    return stat.isDirectory;
  } catch (_) {
    return false;
  }
}
