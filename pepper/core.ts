/**
 * INFO: Tools to manipulate and render Markdown
 */

import { WalkEntry } from "https://deno.land/std/fs/mod.ts";
import { Remarkable } from "../external/remarkable.js";
import meta from "../external/remarkable-meta.js";
import wikilinks from "../external/remarkable-wikilink.js";
import { remarkablePluginHeadingId } from "../external/remarkable-plugin-heading-id.js";
import hljs from "../external/highlight.js";
import { Link } from "./model.ts";
import { globFiles } from "../common/fs.ts";

let md = new Remarkable({
  html: true,
  highlight: function (str: any, lang: any) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
        console.log(err);
      }
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {
      console.log(err);
    }

    return ""; // use external default escaping
  },
});
md.use(meta);
md.use(wikilinks);
md.use(remarkablePluginHeadingId, {
  // this option is for create id, optional option, default value is (level, content, idx) => `${content}`
  createId: (level: 1 | 2 | 3 | 4 | 5 | 6, content: string, idx: number) =>
    normaliseLink(content),
});
md.inline.ruler.disable(["escape"]);

export function createMarkdownTOC(content: string) {
  return content
    .split("\n")
    .filter((x) => x.startsWith("##"))
    .map((x) => x.substring(1))
    .map((x) => {
      let parts = x.split("# ");
      return (
        parts[0] +
        "# " +
        `<a href="%${normaliseLink(parts[1] == undefined ? "" : parts[1])}">${
          parts[1]
        }</a>`
      );
    })
    .map((x) =>
      x.replaceAll("# ", "- ").replaceAll("#", "\t").replaceAll("%", "#")
    )
    .join("\n");
  //
}

export function renderMarkdownSnippetAsHTML(snippet: string) {
  let renderer = new Remarkable({ html: true });
  return md.render(snippet);
}

abstract class SourceFile {
  protected _content: string;

  constructor(content: string) {
    this._content = content;
  }

  abstract renderToHTML(): string;
}

export class MarkdownFile extends SourceFile {
  private readonly _title: string;
  private readonly _mTime: Date;

  constructor(title: string, content: string, mTime: Date) {
    super(content);
    this._title = title;
    this._mTime = mTime;
  }

  get mTime(): Date {
    return this._mTime;
  }

  public get title(): string {
    return this._title;
  }

  public get content(): string {
    return this._content;
  }

  public set content(value: string) {
    this._content = value;
  }

  private _backlinks: Set<string> = new Set();

  public get backlinks(): Set<string> {
    return this._backlinks;
  }

  renderToHTML(): string {
    const env = { frontMatter: undefined };
    const result = md.render(this.content, env);
    // console.log(env);
    return result;
  }
}

export function normaliseLink(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("'", "")
    .replaceAll("(", "")
    .replaceAll(")", "");
}

export function getAllMardownFiles(path: string): Array<WalkEntry> {
  return globFiles(path, "md", true);
}

export function getAllJupyterFiles(path: string): Array<WalkEntry> {
  return globFiles(path, "ipynb", true);
}

/**
 * Parse a WikiLink (e.g. `[[This is a link#header|My name]]) into a Link object
 * @param wikilink
 */
export function parseWikiLink(wikilink: string): Link {
  const link: Link = { realName: "" };
  if (wikilink.includes("|")) {
    const parts = wikilink.split("|");
    link.titleName = parts[1];
    link.realName = parts[0];
  } else {
    link.realName = wikilink;
  }
  if (link.realName.includes("#")) {
    const parts = link.realName.split("#");
    link.realName = parts[0];
    link.fragment = parts[1];
  }
  if (link.titleName == null) {
    link.titleName = link.realName;
  }
  return link;
}
