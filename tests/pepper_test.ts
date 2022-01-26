import {
  getAllMardownFiles,
  MarkdownFile,
  parseWikiLink,
} from "../pepper/core.ts";
import { Link } from "../pepper/model.ts";

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
  const mdFiles = files.map(
    (x) => new MarkdownFile(x.path, x.name, new Date()),
  );
  assertEquals(mdFiles.length, 3);
});

// Test WikiLink parsing
Deno.test("Pepper :: Wiki links :: simple link", () => {
  const wikilink = "This is a link";
  const parsed: Link = parseWikiLink(wikilink);
  assertEquals(parsed.realName, "This is a link");
  assertEquals(parsed.titleName, "This is a link");
  assertEquals(parsed.fragment, undefined);
});
Deno.test("Pepper :: Wiki links :: title, no fragment", () => {
  const wikilink = "This is a link|But I call it Foo";
  const parsed: Link = parseWikiLink(wikilink);
  assertEquals(parsed.realName, "This is a link");
  assertEquals(parsed.titleName, "But I call it Foo");
  assertEquals(parsed.fragment, undefined);
});
Deno.test("Pepper :: Wiki links :: title and fragment", () => {
  const wikilink = "This is a link#Section|But I call it Foo";
  const parsed: Link = parseWikiLink(wikilink);
  assertEquals(parsed.realName, "This is a link");
  assertEquals(parsed.titleName, "But I call it Foo");
  assertEquals(parsed.fragment, "Section");
});
Deno.test("Pepper :: Wiki links :: only fragment", () => {
  const wikilink = "This is a link#Section";
  const parsed: Link = parseWikiLink(wikilink);
  assertEquals(parsed.realName, "This is a link");
  assertEquals(parsed.titleName, "This is a link");
  assertEquals(parsed.fragment, "Section");
});
