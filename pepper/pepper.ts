import { expandGlobSync, WalkEntry } from "https://deno.land/std/fs/mod.ts";

class SourceFile {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }
}

export class MarkdownFile extends SourceFile {}

export function getAllMardownFiles(path: string): Array<WalkEntry> {
  const files = [];
  for (const file of expandGlobSync(`${path}/**/*.md`)) {
    files.push(file);
  }
  return files;
}
