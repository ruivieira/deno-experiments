/**
 * INFO: a simple OPML parser
 */
import { SAXParser } from "https://unpkg.com/sax-ts@1.2.8/src/sax.ts";
import { readFileStr } from "https://deno.land/std/fs/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),

    file: new log.handlers.FileHandler("WARNING", {
      filename: "./log.txt",
      // you can change format of output message using any keys in `LogRecord`
      formatter: "{levelName} {msg}",
    }),
  },

  loggers: {
    // configure default logger available via short-hand methods above
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

const logger = log.getLogger();

const strict: boolean = true; // change to false for HTML parsing
const options: {} = {}; // refer to "Arguments" section

export class Outline {
  htmlUrl?: string;
  text?: string;
  title?: string;
  type?: string;
  version?: string;
  xmlUrl?: string;
  children: Array<Outline> = [];
  constructor() {
  }
  toString(): string {
    return `Outline {
        htmlUrl: ${this.htmlUrl}
        text: ${this.text}
        title: ${this.title}
        type: ${this.type};
        version: ${this.version}
        xmlUrl: ${this.xmlUrl}
        children: ${this.children}
      }`;
  }
}

export async function parse(opml: string): Promise<Outline[]> {
  const text = await readFileStr(opml);

  let outlines: Outline[] = [];
  const parser = new SAXParser(strict, options);

  var currentEntry: Outline | null = null;
  var parentEntry: Outline | null = null;
  var currentAttribute: string = "";

  function logFlow(msg: string) {
    logger.debug(`====== ${msg}  ======`);
    logger.debug(`parent entry:`);
    logger.debug(parentEntry == null ? "null" : parentEntry!.toString());
    logger.debug(`current entry:`);
    logger.debug(currentEntry == null ? "null" : currentEntry!.toString());
  }

  parser.onerror = (e: any) => {
    // an error happened.
    logger.error(e);
  };

  parser.onopentag = (node: any) => {
    // opened a tag.  node has "name" and "attributes"
    if (node.name == "outline") {
      if (currentEntry != null && parentEntry != null) {
        parentEntry.children.push(currentEntry);
        parentEntry = currentEntry;
        logFlow("Entering a child entry");
      } else if (currentEntry != null && parentEntry == null) {
        outlines.push(currentEntry);
        currentEntry = new Outline();
        logFlow("Entering a standalong entry");
      } else {
        currentEntry = new Outline();
        logFlow("Entering an entry");
      }
    }
    currentAttribute = node.name;
  };

  parser.onclosetag = function (tagName: string) {
    if (tagName == "outline") {
      if (parentEntry != null) {
        logFlow("Leving an entry");
        currentEntry = parentEntry;
      }
    }
  };
  parser.onattribute = (attr: any) => {
    if (currentAttribute == "outline" && currentEntry != null) {
      if (attr.name == "htmlUrl") {
        currentEntry.htmlUrl = attr.value;
      } else if (attr.name == "text") {
        currentEntry.text = attr.value;
      } else if (attr.name == "title") {
        currentEntry.title = attr.value;
      } else if (attr.name == "type") {
        currentEntry.type = attr.value;
      } else if (attr.name == "version") {
        currentEntry.version = attr.value;
      } else if (attr.name == "xmlUrl") {
        currentEntry.xmlUrl = attr.value;
      }
      logFlow(`Adding attribute ${attr.name}, ${attr.value}`);
    }
  };

  parser.onend = () => {
    // parser stream is done, and ready to have more stuff written to it.
    if (currentEntry != null) {
      outlines.push(currentEntry);
    }
  };

  parser.write(text).close();

  return outlines;
}

let outlines = await parse("./feeds.xml");
console.log(outlines.map((x) => x.title));
