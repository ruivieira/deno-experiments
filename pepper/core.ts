/**
 * INFO: Tools to manipulate and render Markdown
 */

import { existsSync, WalkEntry } from "https://deno.land/std/fs/mod.ts";
import { Remarkable } from "../external/remarkable.js";
import meta from "../external/remarkable-meta.js";
import wikilinks from "../external/remarkable-wikilink.js";
import { remarkablePluginHeadingId } from "../external/remarkable-plugin-heading-id.js";
import hljs from "../external/highlight.js";
import { Link } from "./model.ts";
import { basenameNoExt, globFiles } from "../common/fs.ts";
import { JupyterNotebook } from "../jupyter/parse.ts";
import { dirname, join } from "https://deno.land/std/path/mod.ts";
import { render } from "https://deno.land/x/eta/mod.ts";
import { pageTemplate } from "../../pepper/templates/page.eta.ts";
import { contentsTemplate } from "../../pepper/templates/contents.eta.ts";
import { graphTemplate } from "../../pepper/templates/graph.eta.ts";
import { searchTemplate } from "../../pepper/templates/search.eta.ts";
import { Html5Entities } from "https://deno.land/x/html_entities/mod.js";
import { decode as base64Decode } from "https://deno.land/std/encoding/base64.ts";
import { format } from "../external/timeago.js";
import { renderSitemap } from "../web/utils/sitemap.ts";
import ProgressBar from "https://deno.land/x/progress@v1.1.4/mod.ts";
import { bgCyan, bgMagenta } from "https://deno.land/std/fmt/colors.ts";

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
type MarkdownMap = { [p: string]: MarkdownFile };

export class Pepper {
  private root: string;
  private baseURL: string;

  constructor(root: string, dest: string, baseURL: string) {
    this.root = root;
    this.baseURL = baseURL;
    const markdownFiles = getAllMardownFiles(root);
    const [sources, notebooks] = this.getSources(markdownFiles);
    const markdownMap = this.buildMarkdownMap(sources);
    this.getAllWikiLinks(sources, markdownMap);
    this.saveMainPages(sources, dest);
    this.saveJupyterImages(notebooks, root);
    this.createSearchPage(sources, dest);
    this.createSitemap(sources, dest);
    this.createContents(sources, dest);
    this.createJSONGraph(markdownMap, sources, dest);
  }

  getSources(files: WalkEntry[]): [MarkdownFile[], JupyterNotebook[]] {
    const sources: MarkdownFile[] = [];
    const jupyterFiles: JupyterNotebook[] = [];

    const total = files.length;
    const progressBar = new ProgressBar({
      total,
      complete: bgCyan(" "),
      incomplete: bgMagenta(" "),
      display: ":completed/:total collecting :time [:bar] :percent",
    });

    let completed = 0;

    for (const file of files) {
      const title = basenameNoExt(file.path, "md");
      const modified = Deno.statSync(file.path).mtime;
      if (this.hasPair(file.path)) {
        const text = Deno.readTextFileSync(this.getPairPath(file.path));
        const content = JSON.parse(text);
        const notebook = new JupyterNotebook(
          content,
          "./images/",
          normaliseLink(title),
        );
        jupyterFiles.push(notebook);
        sources.push(new MarkdownFile(title, notebook.render(), modified!));
      } else {
        const text = Deno.readTextFileSync(file.path);
        sources.push(new MarkdownFile(title, text, modified!));
      }
      progressBar.render(completed++);
    }
    return [sources, jupyterFiles];
  }

  getPairPath(path: string) {
    const _basename = basenameNoExt(path, "md");
    const _dirname = dirname(path);
    return join(_dirname, _basename + ".ipynb");
  }

  hasPair(path: string) {
    return existsSync(this.getPairPath(path));
  }

  buildMarkdownMap(sources: MarkdownFile[]): MarkdownMap {
    const markdownMap: { [p: string]: MarkdownFile } = {};
    for (const source of sources) {
      markdownMap[source.title] = source;
    }
    return markdownMap;
  }

  getAllWikiLinks(sources: MarkdownFile[], markdownMap: MarkdownMap) {
    // get all the wiki links
    const backlinksRegExp = /\[\[(.*?)]]/g;
    for (const source of sources) {
      const matches = source.content.matchAll(backlinksRegExp);
      for (const match of matches) {
        const wikilink = parseWikiLink(match[1]);
        if (wikilink.realName in markdownMap) {
          markdownMap[wikilink.realName].backlinks.add(source.title);
          const normalisedTitle = normaliseLink(wikilink.realName);
          // replace in markdown content
          if (wikilink.fragment == null) {
            source.content = source.content.replaceAll(
              match[0],
              `[${wikilink.titleName}](${normalisedTitle}.html)`,
            );
          } else {
            source.content = source.content.replaceAll(
              match[0],
              `[${wikilink.titleName}](${normalisedTitle}.html#${wikilink.fragment})`,
            );
          }
        }
      }
    }
  }

  saveMainPages(sources: MarkdownFile[], destination: string) {
    const total = sources.length;
    const progressBar = new ProgressBar({
      total,
      complete: bgCyan(" "),
      incomplete: bgMagenta(" "),
      display: ":completed/:total exporting :time [:bar] :percent",
    });

    let completed = 0;

    for (const source of sources) {
      const toc = renderMarkdownSnippetAsHTML(
        createMarkdownTOC(source.content),
      );
      const s = render(
        pageTemplate,
        {
          title: source.title,
          content: source.renderToHTML(),
          description: `Notes on ${source.title}`,
          canonical: `${normaliseLink(source.title)}.html`,
          backlinks: [...source.backlinks].map((x) => [
            normaliseLink(x) + ".html",
            x,
          ]),
          toc: toc,
          modified: format(source.mTime),
        },
        { async: false, autoEscape: false },
      );
      Deno.writeTextFileSync(
        `${destination}/${normaliseLink(source.title)}.html`,
        s as string,
      );
      progressBar.render(completed++);
    }
  }

  saveJupyterImages(jupyterFiles: JupyterNotebook[], source: string) {
    // save all the Jupyter notebook images
    for (const notebook of jupyterFiles) {
      for (const image of Object.keys(notebook.images)) {
        const content = notebook.images[image];
        const data = base64Decode(content);
        Deno.writeFileSync(
          join(source, notebook.imageFolder, image + ".png"),
          data,
        );
      }
    }
  }
  createSearchPage(sources: MarkdownFile[], destination: string) {
    const script = [
      'var index = new FlexSearch({encode: "icase", tokenize: "forward", async: false});',
      "let docs = [];",
    ];
    let i = 1;
    for (const source of sources) {
      // escape HTML entities so they don't mess with the Javascript source
      const text = Html5Entities.encodeNonUTF(
        source.content.replace(/\s\s+/g, " "),
      );
      const doc = {
        id: i,
        title: source.title,
        url: `/${normaliseLink(source.title)}.html`,
      };
      script.push(`index.add(${i}, ${JSON.stringify(text)});`);
      script.push(`docs.push(${JSON.stringify(doc)});`);
      i += 1;
    }
    let s = render(
      searchTemplate,
      {
        script: script.join("\n"),
      },
      { async: false, autoEscape: false },
    );
    Deno.writeTextFileSync(`${destination}/search.html`, s as string);
  }
  createSitemap(sources: MarkdownFile[], destination: string) {
    const links = [];
    for (const source of sources) {
      const d = source.mTime;
      const dateString =
        `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}T${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}Z`;
      links.push({
        url: this.baseURL + normaliseLink(source.title) + ".html",
        modified: dateString,
      });
    }
    const sitemap = renderSitemap(links);
    Deno.writeTextFileSync(`${destination}/sitemap.xml`, sitemap);
  }
  createContents(sources: MarkdownFile[], destination: string) {
    let allLinks = sources.map((source) => {
      return {
        title: source.title,
        url: `/${normaliseLink(source.title)}.html`,
      };
    });

    allLinks = allLinks.sort((a, b) => {
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
      return 0;
    });

    let s = render(
      contentsTemplate,
      {
        links: allLinks,
      },
      { async: false, autoEscape: false },
    );
    Deno.writeTextFileSync(`${destination}/content.html`, s as string);
  }
  createJSONGraph(
    markdownMap: MarkdownMap,
    sources: MarkdownFile[],
    destination: string,
  ) {
    const nodes = [];
    const uniqueNodes: Set<string> = new Set<string>();
    const edges = [];
    for (const source of sources) {
      uniqueNodes.add(source.title);
      for (const backlink of source.backlinks) {
        uniqueNodes.add(backlink);
      }
    }
    const nodesIndex = Array.from(uniqueNodes);

    let i = 0;
    for (const node of nodesIndex) {
      nodes.push({ id: i, label: node, url: normaliseLink(node) + ".html" });
      i += 1;
    }

    for (const source of sources) {
      for (const backlink of source.backlinks) {
        const toIndex = nodesIndex.findIndex((x) => x == source.title);
        const fromIndex = nodesIndex.findIndex((x) => x == backlink);
        edges.push({ from: fromIndex, to: toIndex });
      }
    }

    let script = `let nodes = ${JSON.stringify(nodes)};\n`;
    script += `let edges = ${JSON.stringify(edges)};\n`;

    Deno.writeTextFileSync(`${destination}/graph.js`, script);

    let s = render(graphTemplate, {}, { async: false, autoEscape: false });
    Deno.writeTextFileSync(`${destination}/graph.html`, s as string);
  }
}
