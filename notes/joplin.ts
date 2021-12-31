/**
 * INFO: tools to manipulate Joplin's notes
 */

import { DB } from "https://deno.land/x/sqlite/mod.ts";

export interface Note {
  id: number;
  title: string;
  body: string;
  createdTime: Date;
}


const HOME = Deno.env.get("HOME");

export function getJoplinDB(): DB {
  return new DB(`${HOME}/.config/joplin-desktop/database.sqlite`);
}

export function listTitles(db: DB): Array<string> {
  const titles: Array<string> = [];
  for (const [title] of db.query("SELECT title FROM notes")) {
    
    titles.push(title as string);
  }
  return titles;
}

export function getAllNotes(db: DB): Array<Note> {
  const notes: Array<Note> = []; 
  for (const [id, title, body, createdTime] of db.query("SELECT id, title, body, created_time FROM notes")) {
    notes.push({
      id: id as number,
      title: title as string,
      body: body as string,
      createdTime: new Date(createdTime as number)
    });
  }
  return notes;
}