/**
 * INFO: tools to manipulate Joplin's notes
 */

import { DB } from "https://deno.land/x/sqlite/mod.ts";

const HOME = Deno.env.get("HOME");

export function getJoplinDB(): DB {
  return new DB(`${HOME}/.config/joplin-desktop/database.sqlite`);
}

export function listTitles(db: DB): Array<string> {
  const titles: Array<string> = [];
  for (const [title] of db.query("SELECT title FROM notes")) {
    titles.push(title);
  }
  return titles;
}
