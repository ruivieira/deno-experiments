/**
 * INFO: a simple RSS parser
 */
import { SAXParser } from "https://unpkg.com/sax-ts@1.2.8/src/sax.ts";

const strict: boolean = true; // change to false for HTML parsing
const options: {} = {}; // refer to "Arguments" section

async function parseFeed(feedURL: string): Promise<any[]> {
  const text = await fetch(feedURL).then((x) => x.text());
  console.log(text);

  let feedItems: any[] = [];
  const parser = new SAXParser(strict, options);

  var currentEntry: any = null;
  var currentAttribute: string = "";

  parser.onerror = (e: any) => {
    // an error happened.
    console.error(e);
  };

  parser.ontext = (t: any) => {
    // got some text.  t is the string of text.
    if (currentAttribute != "" && currentEntry != null) {
      currentEntry[currentAttribute] = t;
    }
    // console.log("onText: ", t);
  };

  parser.onopentag = (node: any) => {
    // opened a tag.  node has "name" and "attributes"
    if (node.name == "title") {
      if (currentEntry != null) {
        feedItems.push(currentEntry);
      }
      currentEntry = {};
      currentAttribute = "title";
    } else if (node.name == "link") {
      currentAttribute = "link";
    } else if (node.name == "pubDate") {
      currentAttribute = "pubDate";
    } else if (node.name == "comments") {
      currentAttribute = "comments";
    } else {
      currentAttribute = "";
    }
    // console.log("onOpenTag: ", node);
  };

  parser.onclosetag = function (tagName: string) {
    // console.log(`onCloseTag: ${tagName}`);
  };
  parser.onattribute = (attr: any) => {
    // an attribute.  attr has "name" and "value"
    // console.log("onAttribute: ", attr);
  };

  parser.onend = () => {
    // parser stream is done, and ready to have more stuff written to it.
    feedItems.push(currentEntry);
    // console.warn("end of XML");
  };

  parser.write(text).close();

  return feedItems;
}

let feeds = await parseFeed("https://news.ycombinator.com/rss");
console.log(feeds);
