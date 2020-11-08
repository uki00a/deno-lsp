import { assert, assertEquals, assertStrictEquals, path } from "./deps.ts";
import { Project } from "./project.ts";

Deno.test("Project constructor()", () => {
  const rootPath = "/home/foo/ghq/github.com/bar/deno-lsp";
  const project = new Project(
    rootPath,
    ["add.ts", "mod.ts"],
  );
  assertEquals(project.scriptFileNames(), ["add.ts", "mod.ts"]);
  assert(project.hasScriptFile("add.ts"));
  assert(project.hasScriptFile("mod.ts"));
  assert(!project.hasScriptFile("nosuchfile.ts"));
  assertStrictEquals(project.rootPath(), rootPath);
});

Deno.test("Project.addScriptFile()", () => {
  const rootUri = "/home/bar/ghq/github.com/hoge/deno-lsp";
  const project = new Project(rootUri, ["a.ts", "b.ts"]);
  project.addScriptFile("c.ts");
  project.addScriptFile(path.join(rootUri, "subdir", "d.ts"));
  assertEquals(
    project.scriptFileNames(),
    ["a.ts", "b.ts", "c.ts", "subdir/d.ts"],
  );
  assertStrictEquals(project.versionFor("c.ts"), 0);
  assertStrictEquals(project.versionFor("subdir/d.ts"), 0);
});

Deno.test("Project.relativizeScriptFileName()", () => {
  const rootUri = "/home/bar/ghq/github.com/foo/deno-lsp";
  const project = new Project(rootUri, []);
  assertStrictEquals(
    project.relativizeScriptFileName(
      "/home/bar/ghq/github.com/foo/deno-lsp/subdir/add.ts",
    ),
    "subdir/add.ts",
  );
  assertStrictEquals(project.relativizeScriptFileName("a.ts"), "a.ts");
});
