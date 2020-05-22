import {parseFeed} from "./rss.ts"

let feeds = await parseFeed("https://news.ycombinator.com/rss");
console.log(feeds);
