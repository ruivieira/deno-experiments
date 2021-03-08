import { getAllMardownFiles, MarkdownFile } from "../pepper/pepper.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Pepper :: getAllMarkdownFiles :: correct number of files", () => {
  const __dirname = new URL(".", import.meta.url).pathname;
  const files = getAllMardownFiles(`${__dirname}//assets`);
  assertEquals(files.length, 3);
});
Deno.test("Pepper :: getAllMarkdownFiles :: correct name of files", () => {
  const __dirname = new URL(".", import.meta.url).pathname;
  const files = getAllMardownFiles(`${__dirname}//assets`);
  const names = files.map((x) => x.name);
  assertEquals(names.sort(), ["File 2.md", "file1.md", "file3.md"]);
});
Deno.test("Pepper :: getAllMarkdownFiles :: create MarkdownFile", () => {
  const __dirname = new URL(".", import.meta.url).pathname;
  const files = getAllMardownFiles(`${__dirname}//assets`);
  const mdFiles = files.map((x) => new MarkdownFile(x.path));
  assertEquals(mdFiles.length, 3);
});
