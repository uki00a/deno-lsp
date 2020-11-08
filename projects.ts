import { assert } from "./deps.ts";
import { Project } from "./project.ts";
import type { TextDocument } from "./text_document.ts";

export class Projects {
  private readonly projects: Project[] = [];

  findProjectByTextDocument(textDocument: TextDocument): Project {
    assert(textDocument, "textDocument must be given");
    const pathname = new URL(textDocument.uri).pathname;
    for (const project of this.projects) {
      if (pathname.startsWith(project.rootPath())) {
        return project;
      }
    }
    throw new Error("project not found: " + textDocument.uri);
  }

  addProject(project: Project): void {
    this.projects.push(project);
  }

  addTextDocument(textDocument: TextDocument): void {
    const project = this.findProjectByTextDocument(textDocument);
    project.addScriptFile(textDocument.pathname());
  }

  fileNameOfTextDocument(textDocument: TextDocument): string {
    const project = this.findProjectByTextDocument(textDocument);
    return project.relativizeScriptFileName(textDocument.pathname());
  }
}
